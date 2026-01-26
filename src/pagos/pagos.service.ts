import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PrismaService } from '@prisma/prisma.service';
import { EstadoRequisicion, TipoPago } from '@/generated/prisma/enums';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePagoDto, soporteFactura: Express.Multer.File | undefined) {
    const requisicion = await this.prisma.requisicion.findUnique({
      where: { id: Number(dto.requisicionId) },
    });
    if (!requisicion) {
      throw new NotFoundException('La requisición no existe');
    }
    if (requisicion.estado !== 'APROBADA' && requisicion.estado !== 'PASADA_A_CAJA_MENOR') {
      throw new BadRequestException(
        'La requisición debe estar aprobada o pasada a caja menor para poder registrar un pago',
      );
    }

    if (Number(requisicion.valorDefinido) < Number(dto.total)) {
      throw new BadRequestException(
        'El valor del pago no puede ser mayor al valor presupuestado de la requisición',
      );
    }

    // si es partida no presupuestada, se crea el pago y se actualiza el estado de la requisicion a pagado
    if (requisicion.partidaNoPresupuestada) {
      const pago = await this.prisma.$transaction(async (tx) => {
        const nuevoPago = await tx.pago.create({
          data: {
            requisicionId: Number(dto.requisicionId),
            usuarioRegistradorId: dto.usuarioRegistradorId,
            total: Number(dto.total),
            tipoPago: dto.tipoPago,
            soporteFactura: soporteFactura?.path ?? null,
          },
        });

        await tx.requisicion.update({
          where: { id: Number(dto.requisicionId) },
          data: { estado: 'PAGADO' },
        });
        return nuevoPago;
      });

      return {
        data: pago,
        message: 'Pago de partida no presupuestada creado con éxito',
      };
    } else {
      // si es requisicion normal, se crea el pago y se actualiza el estado de la requisicion a pagado y se actualiza el presupuesto
      const pago = await this.prisma.$transaction(async (tx) => {
        const nuevoPago = await tx.pago.create({
          data: {
            requisicionId: Number(dto.requisicionId),
            usuarioRegistradorId: dto.usuarioRegistradorId,
            total: Number(dto.total),
            tipoPago: dto.tipoPago,
            soporteFactura: soporteFactura?.path ?? null,
          },
        });

        await tx.requisicion.update({
          where: { id: Number(dto.requisicionId) },
          data: { estado: 'PAGADO' },
        });

        await tx.presupuesto.update({
          where: { areaId_periodo: { areaId: requisicion.areaId, periodo: requisicion.periodo } },
          data: {
            totalGastado: { increment: Number(dto.total) },
            montoComprometido: { decrement: Number(dto.total) },
          },
        });
        await tx.presupuestoGeneral.update({
          where: { periodo: requisicion.periodo },
          data: {
            totalEjecutado: { increment: Number(dto.total) },
            montoComprometido: { decrement: Number(dto.total) },
          },
        });

        return nuevoPago;
      });

      return {
        data: pago,
        message: 'Pago creado exitosamente',
      };
    }
  }

  findAll() {
    return `This action returns all pagos`;
  }

  async findAllByEstado(periodo: number, estado: EstadoRequisicion) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: { periodo, estado },
      include: {
        area: {
          select: { nombre: true },
        },
        cotizaciones: {
          select: {
            soporteCotizacionPath: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        proveedor: {
          select: { nombre: true },
        },
        articulos: {
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
      const articulo = req.articulos[0];
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
        area: req.area.nombre,
        fechaSolicitud: req.createdAt.toISOString(),
        estado: req.estado,

        solicitanteId: req.usuarioId,
        solicitante: req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : 'N/A',

        proveedor: req.proveedor?.nombre || 'Sin proveedor',

        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',

        cantidad: articulo?.cantidad || 0,
        valorUnitario: articulo?.valorUnitario || 0,
        valorPresupuestado: req.valorPresupuestado,
        valorDefinido: req.valorDefinido,
        comentario: req.comentario,
        motivoRechazo: req.motivoRechazo,
        justificacion: req.justificacion,
        ivaPresupuestado: req.ivaPresupuestado || 0,
        ivaDefinido: req.ivaDefinido || 0,
        aprobadoPor: aprobadoPor,
        numeroComite: req.numeroComite,
        fechaAprobacion: req.updatedAt.toISOString(),
        partidaNoPresupuestada: req.partidaNoPresupuestada,
        soportesCotizaciones: req.cotizaciones.map((cotizacion) => ({
          path: cotizacion.soporteCotizacionPath,
        })),
      };
    });

    return {
      data,
      message: 'Requisiciones pendientes de pago obtenidas exitosamente',
    };
  }

  async pasarAPasaMenor(id: number) {
    const requisicion = await this.prisma.requisicion.findUnique({
      where: {
        id,
      },
    });
    if (!requisicion) {
      throw new NotFoundException('La requisicion no existe');
    }
    if (requisicion.estado !== 'APROBADA') {
      throw new BadRequestException('La requisicion no esta aprobada');
    }

    await this.prisma.requisicion.update({
      where: {
        id,
      },
      data: {
        estado: 'PASADA_A_CAJA_MENOR',
      },
    });
    return {
      data: {
        id: requisicion.id,
        estado: requisicion.estado,
      },
      message: 'Requisicion pasada a caja menor con exito',
    };
  }

  async findAllSolicitudesCajaMenor(cajaMenorId: number) {
    const solicitudes = await this.prisma.solicitudReposicionCajaMenor.findMany({
      where: { cajaMenorId, estado: 'PENDIENTE' },
    });
    if (solicitudes.length === 0) {
      throw new NotFoundException('No se encontraron solicitudes de caja menor pendientes');
    }

    const data = solicitudes.map((solicitud) => {
      return {
        id: solicitud.id,
        estado: solicitud.estado,
        montoSolicitado: solicitud.montoSolicitado,
        justificacion: solicitud.justificacion,
        fechaSolicitud: solicitud.createdAt.toISOString(),
        fechaAprobacion: solicitud.fechaAprobacion?.toISOString(),
        montoAprobado: solicitud.montoAprobado,
        cajaMenorId: solicitud.cajaMenorId,
      };
    });
    return {
      data,
      message: 'Solicitudes de caja menor obtenidas exitosamente',
    };
  }

  async findAllHistorial(periodo: number, tipoPago: TipoPago) {
    let whereClause = {};
    if (tipoPago === TipoPago.TESORERIA) {
      whereClause = {
        requisicion: {
          periodo: periodo,
        },
      };
    } else {
      whereClause = {
        tipoPago: tipoPago,
        requisicion: {
          periodo: periodo,
        },
      };
    }
    const historial = await this.prisma.pago.findMany({
      where: whereClause,
      include: {
        requisicion: {
          include: {
            area: { select: { nombre: true } },
          },
        },
        usuarioRegistrador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    if (historial.length === 0) {
      throw new NotFoundException(
        'No se encontraron pagos para el periodo: ' + periodo + ' y tipo de pago: ' + tipoPago,
      );
    }

    const data = historial.map((pago) => {
      return {
        id: pago.id,
        tipoPago: pago.tipoPago,
        total: pago.total,
        fecha: pago.createdAt.toISOString(),
        areaSolicitante: pago.requisicion.area.nombre,
        usuarioRegistrador: pago.usuarioRegistrador.nombre + ' ' + pago.usuarioRegistrador.apellido,
        soporteFactura: pago.soporteFactura,
        estadoRequisicion: pago.requisicion.estado,
        estado: pago.requisicion.estado,
        tipoRequisicion: pago.requisicion.partidaNoPresupuestada
          ? 'PARTIDA NO PRESUPUESTADA'
          : 'REQUISICION',
      };
    });

    return {
      data,
      message: 'Historial de pagos obtenido exitosamente',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
