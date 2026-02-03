import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSalidaProductoDto } from './dto/create-salida-producto.dto';
import { PrismaService } from '@prisma/prisma.service';
import { AprobarSalidaProductoDto } from './dto/aprobar-salida-producto.dto';
import { RechazarSalidaProductoDto } from './dto/rechazar-salida-producto.dto';

@Injectable()
export class SalidaProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerProductosDisponibles(areaId: number) {
    const productos = await this.prisma.inventarioArea.findMany({
      where: {
        areaId,
      },
      include: {
        producto: true,
      },
    });

    if (!productos || productos.length === 0) {
      throw new NotFoundException(
        'No se encontraron productos disponibles para el area especificada',
      );
    }

    const productosDisponibles = productos.map((producto) => ({
      id: producto.id,
      nombre: producto.producto.nombre,
      cantidad: producto.stockActual,
      producto: {
        id: producto.producto.id,
        nombre: producto.producto.nombre,
        tipo: producto.producto.tipo,
        conceptoContableId: producto.producto.conceptoContableId,
      },
    }));

    return {
      data: productosDisponibles,
      message: 'Productos disponibles obtenidos con éxito',
    };
  }

  async createSolicitudSalidaProducto(createSalidaProductoDto: CreateSalidaProductoDto) {
    const inventario = await this.prisma.inventarioArea.findFirst({
      where: {
        areaId: createSalidaProductoDto.areaId,
        productoId: createSalidaProductoDto.productoId,
      },
      select: { stockActual: true },
    });

    if (!inventario) {
      throw new NotFoundException('No se encontró el producto en el inventario');
    }

    const solicitud = await this.prisma.solicitudSalidaProducto.create({
      data: {
        areaId: createSalidaProductoDto.areaId,
        productoId: createSalidaProductoDto.productoId,
        solicitadoPorId: createSalidaProductoDto.solicitadoPorId,
        cantidad: createSalidaProductoDto.cantidad,
        estado: 'PENDIENTE',
        justificacion: createSalidaProductoDto.justificacion ?? null,
      },
    });

    return {
      data: solicitud,
      message: 'Solicitud de salida de producto creada con éxito',
    };
  }

  async aprobarSolicitudSalidaProducto(aprobarSalidaProductoDto: AprobarSalidaProductoDto) {
    const solicitud = await this.prisma.$transaction(async (tx) => {
      const solicitudPendiente = await tx.solicitudSalidaProducto.findUnique({
        where: { id: aprobarSalidaProductoDto.idSalida },
      });

      if (!solicitudPendiente) {
        throw new NotFoundException('No se encontró la solicitud de salida');
      }
      if (solicitudPendiente.estado !== 'PENDIENTE') {
        throw new BadRequestException('La solicitud ya fue procesada (aprobada o rechazada)');
      }

      const inventario = await tx.inventarioArea.findUnique({
        where: {
          areaId_productoId: {
            areaId: solicitudPendiente.areaId,
            productoId: solicitudPendiente.productoId,
          },
        },
        select: { stockActual: true },
      });

      if (!inventario) {
        throw new NotFoundException('No se encontró el producto en el inventario');
      }
      if (Number(inventario.stockActual) < Number(solicitudPendiente.cantidad)) {
        throw new BadRequestException(
          'No hay stock suficiente para aprobar esta solicitud. La cantidad disponible ya no cubre lo solicitado.',
        );
      }

      const solicitudActualizada = await tx.solicitudSalidaProducto.update({
        where: { id: aprobarSalidaProductoDto.idSalida },
        data: {
          estado: 'APROBADA',
          aprobadoPorId: aprobarSalidaProductoDto.aprobadorId,
          fechaAprobacion: new Date(),
        },
      });
      const movimientoCreado = await tx.movimientoInventario.create({
        data: {
          tipo: 'SALIDA',
          areaId: solicitudActualizada.areaId,
          productoId: solicitudActualizada.productoId,
          cantidad: solicitudActualizada.cantidad,
          usuarioId: solicitudActualizada.solicitadoPorId,
          solicitudSalidaProductoId: solicitudActualizada.id,
        },
      });

      const actualizacionStock = await tx.inventarioArea.update({
        where: {
          areaId_productoId: {
            areaId: solicitudActualizada.areaId,
            productoId: solicitudActualizada.productoId,
          },
        },
        data: {
          stockActual: {
            decrement: solicitudActualizada.cantidad,
          },
        },
      });
      return { solicitudActualizada, movimientoCreado, actualizacionStock };
    });
    return {
      data: solicitud,
      message: 'Solicitud de salida de producto aprobada con éxito',
    };
  }

  async rechazarSolicitudSalidaProducto(rechazarSalidaProductoDto: RechazarSalidaProductoDto) {
    const solicitud = await this.prisma.$transaction(async (tx) => {
      const solicitudPendiente = await tx.solicitudSalidaProducto.findUnique({
        where: { id: rechazarSalidaProductoDto.idSalida },
      });

      if (!solicitudPendiente) {
        throw new NotFoundException('No se encontró la solicitud de salida');
      }
      if (solicitudPendiente.estado !== 'PENDIENTE') {
        throw new BadRequestException('La solicitud ya fue procesada (aprobada o rechazada)');
      }

      const solicitudActualizada = await tx.solicitudSalidaProducto.update({
        where: { id: rechazarSalidaProductoDto.idSalida },
        data: {
          estado: 'RECHAZADA',
          motivoRechazo: rechazarSalidaProductoDto.motivoRechazo,
          rechazadoPorId: rechazarSalidaProductoDto.rechazadorId,
          fechaRechazo: new Date(),
        },
      });
      const movimientoCreado = await tx.movimientoInventario.create({
        data: {
          tipo: 'SALIDA',
          areaId: solicitudActualizada.areaId,
          productoId: solicitudActualizada.productoId,
          cantidad: solicitudActualizada.cantidad,
          usuarioId: solicitudActualizada.solicitadoPorId,
          solicitudSalidaProductoId: solicitudActualizada.id,
        },
      });
      return { solicitudActualizada, movimientoCreado };
    });
    return {
      data: {
        solicitud: solicitud.solicitudActualizada,
        movimiento: solicitud.movimientoCreado,
      },
      message: 'Solicitud de salida de producto rechazada con éxito',
    };
  }

  async solicitudesPendientes() {
    const solicitudes = await this.prisma.solicitudSalidaProducto.findMany({
      where: {
        estado: 'PENDIENTE',
      },
      include: {
        area: true,
        producto: true,
        solicitadoPor: true,
      },
    });

    if (!solicitudes || solicitudes.length === 0) {
      throw new NotFoundException('No se encontraron solicitudes de salida de producto pendientes');
    }

    const data = solicitudes.map((solicitud) => ({
      id: solicitud.id,
      area: {
        id: solicitud.area.id,
        nombre: solicitud.area.nombre,
      },
      producto: {
        id: solicitud.producto.id,
        nombre: solicitud.producto.nombre,
      },
      solicitadoPor: solicitud.solicitadoPor.nombre + ' ' + solicitud.solicitadoPor.apellido,
      cantidad: solicitud.cantidad,
      estado: solicitud.estado,
    }));
    return {
      data,
      message: 'Solicitudes de salida de producto pendientes obtenidas con éxito',
    };
  }

  async historialSolicitudes(areaId: number) {
    const historial = await this.prisma.solicitudSalidaProducto.findMany({
      where: {
        areaId,
      },
      include: {
        area: true,
        producto: true,
        aprobadoPor: true,
      },
    });

    if (!historial || historial.length === 0) {
      throw new NotFoundException(
        'No se encontraron solicitudes de salida de producto en el historial',
      );
    }

    const data = historial.map((solicitud) => ({
      id: solicitud.id,
      area: {
        id: solicitud.area.id,
        nombre: solicitud.area.nombre,
      },
      producto: {
        id: solicitud.producto.id,
        nombre: solicitud.producto.nombre,
      },
      aprobadoPor: solicitud?.aprobadoPor?.nombre + ' ' + solicitud?.aprobadoPor?.apellido,
      cantidad: solicitud.cantidad,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.createdAt,
      fechaAprobacion: solicitud.fechaAprobacion,
      justificacion: solicitud.justificacion,
    }));
    return {
      data,
      message: 'Historial de solicitudes de salida de producto obtenido con éxito',
    };
  }
}
