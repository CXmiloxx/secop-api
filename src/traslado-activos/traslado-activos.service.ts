import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrasladoActivoDto } from './dto/create-traslado-activo.dto';
import { UpdateTrasladoActivoDto } from './dto/update-traslado-activo.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class TrasladoActivosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTrasladoActivoDto) {
    const traslado = await this.prisma.$transaction(async (tx) => {
      return await tx.trasladoActivos.create({
        data: dto,
      });
    });

    return {
      data: traslado,
      message: 'Traslado creado correctamente',
    };
  }

  async solicitudesPendientes() {
    const solicitudes = await this.prisma.trasladoActivos.findMany({
      where: {
        estado: 'PENDIENTE',
      },
      include: {
        producto: {
          include: {
            conceptoContable: true,
          },
        },
        areaOrigen: true,
        areaDestino: true,
        solicitadoPor: true,
      },
    });

    const data = solicitudes.map((solicitud) => {
      return {
        id: solicitud.id,
        producto: solicitud.producto.nombre,
        cantidad: solicitud.cantidad,
        conceptoContable: solicitud.producto.conceptoContable.nombre,
        areaOrigen: solicitud.areaOrigen.nombre,
        areaDestino: solicitud.areaDestino.nombre,
        estado: solicitud.estado,
        fechaSolicitud: solicitud.createdAt,
        motivo: solicitud.motivo,
        solicitante: solicitud.solicitadoPor.nombre + ' ' + solicitud.solicitadoPor.apellido,
      };
    });
    return {
      data: data,
      message: 'Solicitudes pendientes obtenidas correctamente',
    };
  }

  async findOne(idProducto: number, areaId: number) {
    console.log(idProducto, areaId);
    const producto = await this.prisma.inventarioArea.findFirst({
      where: {
        productoId: idProducto,
        areaId: areaId,
      },
      include: {
        producto: {
          include: {
            movimientosInventario: true,
            conceptoContable: true,
          },
        },
        area: true,
      },
    });
    if (!producto) {
      throw new NotFoundException('No se encontró el producto en el area');
    }

    // Obtener la última ubicación, o un string vacío si no hay movimientos.
    let ubicacion = '';
    const movimientos = producto.producto.movimientosInventario;
    if (movimientos && movimientos.length > 0) {
      // Puedes cambiar aquí según la lógica deseada, por ejemplo, usar el último movimiento:
      ubicacion = movimientos[movimientos.length - 1].ubicacion || '';
    }

    const data = {
      id: producto.id,
      producto: producto.producto.nombre,
      cantidad: producto.stockActual,
      conceptoContable: producto.producto.conceptoContable.nombre,
      areaActual: producto.area.nombre,
      ubicacion: ubicacion,
    };

    return {
      data,
      message: 'Producto encontrado correctamente',
    };
  }

  async aprobarTraslado(dto: UpdateTrasladoActivoDto) {
    const trasladoExistente = await this.prisma.trasladoActivos.findUnique({
      where: { id: dto.idTraslado },
    });

    if (!trasladoExistente) {
      throw new NotFoundException('No se encontró el traslado');
    }

    if (trasladoExistente.estado !== 'PENDIENTE') {
      throw new BadRequestException('El traslado ya fue procesado');
    }

    return this.prisma.$transaction(async (tx) => {
      const inventarioOrigen = await tx.inventarioArea.findUnique({
        where: {
          areaId_productoId: {
            areaId: trasladoExistente.areaOrigenId,
            productoId: trasladoExistente.productoId,
          },
        },
      });

      if (!inventarioOrigen) {
        throw new NotFoundException('No existe inventario del producto en el área origen');
      }

      if (inventarioOrigen.stockActual < trasladoExistente.cantidad) {
        throw new BadRequestException('Stock insuficiente para realizar el traslado');
      }

      // 1️⃣ descontar en origen
      await tx.inventarioArea.update({
        where: {
          areaId_productoId: {
            areaId: trasladoExistente.areaOrigenId,
            productoId: trasladoExistente.productoId,
          },
        },
        data: {
          stockActual: {
            decrement: trasladoExistente.cantidad,
          },
        },
      });

      // 2️⃣ crear o actualizar destino
      const inventarioDestino = await tx.inventarioArea.findUnique({
        where: {
          areaId_productoId: {
            areaId: trasladoExistente.areaDestinoId,
            productoId: trasladoExistente.productoId,
          },
        },
      });

      if (inventarioDestino) {
        await tx.inventarioArea.update({
          where: {
            areaId_productoId: {
              areaId: trasladoExistente.areaDestinoId,
              productoId: trasladoExistente.productoId,
            },
          },
          data: {
            stockActual: {
              increment: trasladoExistente.cantidad,
            },
          },
        });
      } else {
        await tx.inventarioArea.create({
          data: {
            areaId: trasladoExistente.areaDestinoId,
            productoId: trasladoExistente.productoId,
            stockActual: trasladoExistente.cantidad,
            stockMinimo: 0,
          },
        });
      }

      // 3️⃣ movimiento salida (origen)
      await tx.movimientoInventario.create({
        data: {
          trasladoId: trasladoExistente.id,
          productoId: trasladoExistente.productoId,
          areaId: trasladoExistente.areaOrigenId,
          tipo: 'TRASLADO_SALIDA',
          cantidad: trasladoExistente.cantidad,
          usuarioId: dto.aprobadorId,
        },
      });

      // 4️⃣ movimiento entrada (destino)
      await tx.movimientoInventario.create({
        data: {
          trasladoId: trasladoExistente.id,
          productoId: trasladoExistente.productoId,
          areaId: trasladoExistente.areaDestinoId,
          tipo: 'TRASLADO_ENTRADA',
          cantidad: trasladoExistente.cantidad,
          usuarioId: dto.aprobadorId,
        },
      });

      // 5️⃣ aprobar traslado
      const traslado = await tx.trasladoActivos.update({
        where: { id: trasladoExistente.id },
        data: {
          estado: 'APROBADO',
          aprobadoPorId: dto.aprobadorId,
        },
      });

      return {
        data: traslado,
        message: 'Traslado aprobado correctamente',
      };
    });
  }

  async rechazarTraslado(dto: UpdateTrasladoActivoDto) {
    const trasladoExistente = await this.prisma.trasladoActivos.findFirst({
      where: { id: dto.idTraslado },
    });
    if (!trasladoExistente) {
      throw new NotFoundException('No se encontró el traslado');
    }
    if (trasladoExistente.estado !== 'PENDIENTE') {
      throw new BadRequestException('El traslado ya fue procesado');
    }
    return await this.prisma.$transaction(async (tx) => {
      const trasladoRechazado = await tx.trasladoActivos.update({
        where: { id: dto.idTraslado },
        data: {
          estado: 'RECHAZADO',
          motivoRechazo: dto.motivoRechazo,
          rechazadoPorId: dto.rechazadorId,
        },
      });

      await tx.movimientoInventario.create({
        data: {
          tipo: 'TRASLADO_SALIDA',
          areaId: trasladoExistente.areaOrigenId,
          productoId: trasladoExistente.productoId,
          cantidad: trasladoExistente.cantidad,
          usuarioId: dto.rechazadorId,
          trasladoId: trasladoExistente.id,
        },
      });

      return {
        data: trasladoRechazado,
        message: 'Traslado rechazado correctamente',
      };
    });
  }

  async historialTraslados() {
    const traslados = await this.prisma.trasladoActivos.findMany({
      include: {
        producto: true,
        areaOrigen: true,
        areaDestino: true,
        solicitadoPor: true,
        aprobadoPor: true,
        rechazadoPor: true,
      },
    });
    const data = traslados.map((traslado) => {
      return {
        id: traslado.id,
        producto: traslado.producto.nombre,
        cantidad: traslado.cantidad,
        areaOrigen: traslado.areaOrigen.nombre,
        areaDestino: traslado.areaDestino.nombre,
        estado: traslado.estado,
        fechaSolicitud: traslado.createdAt,
        motivo: traslado.motivo,
        solicitante: traslado.solicitadoPor.nombre + ' ' + traslado.solicitadoPor.apellido,
        aprobador: traslado.aprobadoPor?.nombre + ' ' + traslado.aprobadoPor?.apellido,
        rechazador: traslado.rechazadoPor?.nombre + ' ' + traslado.rechazadoPor?.apellido,
      };
    });
    return {
      data: data,
      message: 'Historial de traslados obtenido correctamente',
    };
  }
}
