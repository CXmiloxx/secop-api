import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCalificacionConsultorDto } from './dto/create-calificacion-consultor.dto';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCalificacionAreaDto } from './dto/create-calificacion-area.dto';

@Injectable()
export class CalificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async createCalificacionConsultor(dto: CreateCalificacionConsultorDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const calificacionProveedor = await tx.calificacionProveedor.create({
        data: {
          consultorId: dto.consultorId,
          requisicionId: dto.requisicionId,
          proveedorId: dto.proveedorId,
          calidadProducto: dto.calidadProducto,
          precio: dto.precio,
          puntualidad: dto.puntualidad,
          tiempoEntrega: dto.tiempoEntrega,
          tiempoGarantia: dto.tiempoGarantia,
          comentario: dto.comentario || null,
        },
      });

      const calificacionTesoreria = await tx.calificacionTesoreria.create({
        data: {
          consultorId: dto.consultorId,
          requisicionId: dto.requisicionId,
          pagoId: dto.pagoIdTesoreria,
          pagoOportuno: dto.pagoOportunoTesoreria,
          comentario: dto.comentarioTesoreria || null,
        },
      });

      await tx.requisicion.update({
        where: { id: dto.requisicionId },
        data: {
          estado: 'PENDIENTE_ENTREGA',
        },
      });

      return { calificacionProveedor, calificacionTesoreria };
    });

    return {
      data: {
        calificacionProveedor: result.calificacionProveedor,
        calificacionTesoreria: result.calificacionTesoreria,
      },
      message: 'Calificaciones creadas con éxito',
    };
  }

  async createCalificacionArea(dto: CreateCalificacionAreaDto) {
    const calificacionArea = await this.prisma.calificacionConsultor.create({
      data: dto,
    });

    if (!calificacionArea) {
      throw new BadRequestException('No se pudo crear la calificación para el consultor');
    }

    await this.prisma.requisicion.update({
      where: { id: dto.requisicionId },
      data: { estado: 'ENTREGADA' },
    });

    return { data: calificacionArea, message: 'Calificación para el consultor creada con éxito' };
  }

  async pendientesCalificar(periodo: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: { periodo, estado: 'PAGADO' },
      include: {
        pagos: {
          select: {
            id: true,
            createdAt: true,
            total: true,
            requisicionId: true,
            soporteFactura: true,
          },
        },
        area: {
          select: { nombre: true },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        proveedor: {
          select: { nombre: true, id: true },
        },
        articulo: {
          include: {
            producto: {
              select: {
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (requisiciones.length === 0) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo: ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulo;
      const pago = req.pagos[0];
      const aprobadoPor =
        req.estado === 'APROBADA'
          ? [
              req.rector ? 'rector' : null,
              req.vicerrector ? 'vicerrector' : null,
              req.sindico ? 'sindico' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'N/A'
          : null;

      return {
        id: req.id,
        proveedorId: req.proveedor?.id ?? null,
        pagoId: pago?.id ?? null,
        area: req.area.nombre,
        estado: req.estado,
        fechaGeneracionPago: pago?.createdAt?.toISOString() ?? null,
        soportePago: pago?.soporteFactura ?? null,

        solicitanteId: req.usuarioId,
        solicitante: req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : 'N/A',

        proveedor: req.proveedor?.nombre || 'Sin proveedor',

        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',

        cantidad: articulo?.cantidad || 0,
        valorDefinido: req.valorDefinido,

        justificacion: req.justificacion,
        aprobadoPor: aprobadoPor,
        daGarantia: req.daGarantia,
        tiempoGarantia: req.tiempoGarantia,
        partidaNoPresupuestada: req.partidaNoPresupuestada,
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas exitosamente',
    };
  }

  async pendientesCalificarArea(periodo: number, areaId: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: { periodo, estado: 'PENDIENTE_ENTREGA', areaId },
      include: {
        pagos: {
          select: {
            id: true,
            createdAt: true,
            total: true,
            soporteFactura: true,
          },
        },
        area: {
          select: { nombre: true },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        proveedor: {
          select: { nombre: true, id: true },
        },
        articulo: {
          include: {
            producto: {
              select: {
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (requisiciones.length === 0) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo: ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulo;
      const pago = req.pagos[0];
      const aprobadoPor =
        req.estado === 'APROBADA'
          ? [
              req.rector ? 'rector' : null,
              req.vicerrector ? 'vicerrector' : null,
              req.sindico ? 'sindico' : null,
            ]
              .filter(Boolean)
              .join(', ') || 'N/A'
          : null;

      return {
        id: req.id,
        proveedorId: req.proveedor?.id ?? null,
        pagoId: pago?.id ?? null,
        area: req.area.nombre,
        estado: req.estado,
        fechaGeneracionPago: pago?.createdAt?.toISOString() ?? null,
        soportePago: pago?.soporteFactura ?? null,

        solicitanteId: req.usuarioId,
        solicitante: req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : 'N/A',

        proveedor: req.proveedor?.nombre || 'Sin proveedor',

        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',

        cantidad: articulo?.cantidad || 0,
        valorDefinido: req.valorDefinido,

        justificacion: req.justificacion,
        aprobadoPor: aprobadoPor,
        daGarantia: req.daGarantia,
        tiempoGarantia: req.tiempoGarantia,
        partidaNoPresupuestada: req.partidaNoPresupuestada,
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas exitosamente',
    };
  }

  async historialCalificaciones(periodo: number, tipo: 'proveedor' | 'tesoreria') {
    if (tipo === 'proveedor') {
      const historial = await this.prisma.calificacionProveedor.findMany({
        where: {
          requisicion: {
            periodo: periodo,
          },
        },
        include: {
          requisicion: true,
          proveedor: true,
          consultor: true,
        },
      });

      if (historial.length === 0) {
        throw new NotFoundException('No se encontraron historiales de calificaciones');
      }

      const dataMap = historial.map((item) => {
        return {
          id: item.id,
          requisicionId: item.requisicionId,
          proveedorId: item.proveedorId,
          consultorId: item.consultorId,
          proveedor: item.proveedor.nombre,
          comentario: item.comentario,
          fechaCalificacion: item.createdAt.toISOString(),
          calificaciones: {
            calidadProducto: item.calidadProducto,
            precio: item.precio,
            puntualidad: item.puntualidad,
            tiempoEntrega: item.tiempoEntrega,
            tiempoGarantia: item.tiempoGarantia,
          },
        };
      });

      return {
        data: dataMap,
        message: 'Historial de calificaciones obtenido correctamente para proveedores',
      };
    } else if (tipo === 'tesoreria') {
      const historial = await this.prisma.calificacionTesoreria.findMany({
        where: {
          requisicion: {
            periodo: periodo,
          },
        },
        include: {
          requisicion: {
            include: {
              proveedor: true,
            },
          },
          pago: true,
          consultor: true,
        },
      });

      if (historial.length === 0) {
        throw new NotFoundException('No se encontraron historiales de calificaciones');
      }

      const dataMap = historial.map((item) => {
        return {
          id: item.id,
          proveedor: item.requisicion?.proveedor?.nombre || 'Sin proveedor',
          comentario: item.comentario,
          fechaCalificacion: item.createdAt.toISOString(),
          calificaciones: {
            pagoOportuno: item.pagoOportuno,
          },
        };
      });

      return {
        data: dataMap,
        message: 'Historial de calificaciones obtenido correctamente para tesoreria',
      };
    }
  }

  async historialCalificacionesArea(periodo: number, areaId: number) {
    const historial = await this.prisma.calificacionConsultor.findMany({
      where: {
        requisicion: {
          periodo: periodo,
          areaId: areaId,
        },
      },
      include: {
        requisicion: {
          include: {
            proveedor: true,
          },
        },
        consultor: true,
        area: true,
      },
    });
    if (historial.length === 0) {
      throw new NotFoundException('No se encontraron historiales de calificaciones');
    }

    const dataMap = historial.map((item) => {
      return {
        id: item.id,
        requisicionId: item.requisicionId,
        proveedorId: item.requisicion?.proveedor?.id ?? null,
        consultorId: item.consultorId,
        proveedor: item.requisicion?.proveedor?.nombre ?? 'Sin proveedor',
        comentario: item.comentario,
        fechaCalificacion: item.createdAt.toISOString(),
        calificaciones: {
          calidadProducto: item.calidadProducto,
          tiempoEntrega: item.tiempoEntrega,
          comentario: item.comentario,
        },
      };
    });

    return {
      data: dataMap,
      message: 'Historial de calificaciones obtenido correctamente para area',
    };
  }
}
