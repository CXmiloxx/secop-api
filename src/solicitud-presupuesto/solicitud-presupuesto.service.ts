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

    //2. Verificar si el usuario tiene presupuesto disponible
    const presupuestoDisponible = await this.prisma.presupuesto.findFirst({
      where: {
        areaId: createSolicitudPresupuestoDto.areaId,
        periodoId: createSolicitudPresupuestoDto.periodoId,
      },
    });

    if (!presupuestoDisponible) {
      throw new BadRequestException('No hay presupuesto disponible para este periodo');
    }

    // 3. Crear solicitud + ítems (en transacción)
    const solicitud = await this.prisma.$transaction(async (tx) => {
      const nuevaSolicitud = await tx.solicitudPresupuesto.create({
        data: {
          areaId: createSolicitudPresupuestoDto.areaId,
          periodoId: createSolicitudPresupuestoDto.periodoId,
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
          productoId: item.productoId,
          conceptoContableId: item.conceptoContableId,
          cuentaContableId: item.cuentaContableId,
          cantidadSolicitada: item.cantidadSolicitada,
          valorUnitario: item.valorUnitario,
        })),
      });

      return nuevaSolicitud;
    });
    return {
      data: solicitud,
      message: 'Solicitud de presupuesto creada con exito',
    };
  }

  findAll() {
    return `This action returns all solicitarPresupuesto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} solicitarPresupuesto`;
  }

  update(id: number, updateSolicitudPresupuestoDto: UpdateSolicitudPresupuestoDto) {
    return `This action updates a #${id} solicitudPresupuesto: ${JSON.stringify(updateSolicitudPresupuestoDto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitarPresupuesto`;
  }
}
