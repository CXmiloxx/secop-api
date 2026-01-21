import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { PrismaService } from '@prisma/prisma.service';
import { EstadoRequisicion } from '@/generated/prisma/enums';

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePagoDto, soporteFactura: Express.Multer.File | undefined) {
    const requisicion = await this.prisma.requisicion.findUnique({
      where: { id: Number(dto.requisicionId) },
    });
    if (!requisicion) {
      throw new NotFoundException('La requisicion no existe');
    }
    if (requisicion.estado !== 'APROBADA' && requisicion.estado !== 'PASADA_A_CAJA_MENOR') {
      throw new BadRequestException('La requisicion no esta aprobada o pasada a caja menor');
    }

    if (Number(requisicion.valorDefinido) < Number(dto.total)) {
      throw new BadRequestException(
        'El valor del pago no puede ser mayor al valor presupuestado de la requisicion',
      );
    }

    const pago = await this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          ...dto,
          requisicionId: Number(dto.requisicionId),
          usuarioRegistradorId: dto.usuarioRegistradorId,
          total: Number(dto.total),
          metodoPago: dto.metodoPago,
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
          totalGastado: { increment: dto.total },
          montoComprometido: { decrement: dto.total },
        },
      });
      await tx.presupuestoGeneral.update({
        where: { periodo: requisicion.periodo },
        data: {
          totalEjecutado: { increment: dto.total },
          montoComprometido: { decrement: dto.total },
        },
      });
      return nuevoPago;
    });
    return {
      data: pago,
      message: 'Pago creado con exito',
    };
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

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
