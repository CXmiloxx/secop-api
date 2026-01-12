import { CreateSolicitudPresupuestoDto } from '@/solicitud-presupuesto/dto/create-solicitud-presupuesto.dto';
import { UpdateSolicitudPresupuestoDto } from '@/solicitud-presupuesto/dto/update-solicitud-presupuesto.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class SolicitudPresupuestoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSolicitudPresupuestoDto: CreateSolicitudPresupuestoDto) {
    const usuarioSolicitante = await this.prisma.usuario.findUnique({
      where: { id: createSolicitudPresupuestoDto.usuarioSolicitanteId },
      include: {
        area: true,
      },
    });

    //1. Verificar si el usuario solicita presupuesto para su propia área
    if (usuarioSolicitante?.areaId !== createSolicitudPresupuestoDto.areaId) {
      throw new BadRequestException('No puedes solicitar presupuesto para otra área');
    }

    // 3. Crear solicitud + ítems (en transacción)
    const solicitud = await this.prisma.$transaction(async (tx) => {
      const nuevaSolicitud = await tx.solicitudPresupuesto.create({
        data: {
          areaId: createSolicitudPresupuestoDto.areaId,
          periodo: createSolicitudPresupuestoDto.periodo,
          usuarioSolicitanteId: createSolicitudPresupuestoDto.usuarioSolicitanteId,
          estado: 'PENDIENTE',
          montoSolicitado: createSolicitudPresupuestoDto.montoSolicitado,
          justificacion: createSolicitudPresupuestoDto.justificacion,
        },
      });

      // Crear ítems
      await tx.articuloSolicitudPresupuesto.createMany({
        data: createSolicitudPresupuestoDto.articulos.map((item) => ({
          solicitudId: nuevaSolicitud.id,
          conceptoContableId: item.conceptoContableId,
          cuentaContableId: item.cuentaContableId,
          valorEstimado: item.valorEstimado,
        })),
      });

      return nuevaSolicitud;
    });
    return {
      data: solicitud,
      message: 'Solicitud de presupuesto creada con exito',
    };
  }

  async findAll(periodo: number) {
    const data = await this.prisma.solicitudPresupuesto.findMany({
      where: {
        periodo,
      },
      select: {
        id: true,
        periodo: true,
        montoSolicitado: true,
        createdAt: true,
        estado: true,
        articulos: {
          select: {
            conceptoContable: {
              select: {
                id: true,
                nombre: true,
              },
            },
            cuentaContable: {
              select: {
                id: true,
                nombre: true,
              },
            },
            valorEstimado: true,
          },
        },
        usuarioSolicitante: {
          select: {
            id: true,
            nombre: true,
          },
        },
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return {
      data,
      message: 'Solicitudes de presupuesto obtenidas con éxito',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitarPresupuesto`;
  }

  async update(id: number, dto: UpdateSolicitudPresupuestoDto) {
    return this.prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudPresupuesto.findUnique({
        where: { id },
      });

      if (!solicitud) {
        throw new BadRequestException('Solicitud no encontrada');
      }

      if (solicitud.estado === 'APROBADO') {
        throw new BadRequestException('Esta solicitud ya fue aprobada');
      }

      // 1. Aprobar solicitud
      await tx.solicitudPresupuesto.update({
        where: { id },
        data: {
          estado: 'APROBADO',
          montoAprobado: dto.montoAprobado,
          porcentajeAprobacion: dto.porcentajeAprobacion,
          aprobadoPorId: dto.aprobadoPorId,
          fechaAprobacion: dto.fechaAprobacion,
        },
      });

      // 2. Presupuesto del área (acumulativo)
      await tx.presupuesto.upsert({
        where: {
          areaId_periodo: {
            areaId: solicitud.areaId,
            periodo: solicitud.periodo,
          },
        },
        update: {
          presupuestoAnual: { increment: dto.montoAprobado },
          saldoDisponible: { increment: dto.montoAprobado },
        },
        create: {
          areaId: solicitud.areaId,
          periodo: solicitud.periodo,
          presupuestoAnual: dto.montoAprobado ?? 0,
          totalGastado: 0,
          montoComprometido: 0,
          saldoDisponible: dto.montoAprobado,
        },
      });

      // 3. Presupuesto general (suma global)
      await tx.presupuestoGeneral.upsert({
        where: { periodo: solicitud.periodo },
        update: {
          presupuestoTotal: { increment: dto.montoAprobado },
          saldoDisponible: { increment: dto.montoAprobado },
        },
        create: {
          periodo: solicitud.periodo,
          presupuestoTotal: dto.montoAprobado ?? 0,
          totalEjecutado: 0,
          montoComprometido: 0,
          saldoDisponible: dto.montoAprobado ?? 0,
        },
      });
      //4. Actualizar los valores aprobados de los articulos de la solicitud
      for (const item of dto?.articulos ?? []) {
        await tx.articuloSolicitudPresupuesto.update({
          where: {
            solicitudId_cuentaContableId: {
              solicitudId: id,
              cuentaContableId: item.cuentaContableId,
            },
          },
          data: {
            valorAprobado: item.valorAprobado,
          },
        });
      }

      return { message: 'Solicitud aprobada y presupuestos actualizados' };
    });
  }

  remove(id: number) {
    return `This action removes a #${id} solicitarPresupuesto`;
  }
}
