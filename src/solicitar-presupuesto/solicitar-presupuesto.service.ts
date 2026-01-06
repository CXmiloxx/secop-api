import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSolicitarPresupuestoDto } from './dto/create-solicitar-presupuesto.dto';
import { UpdateSolicitarPresupuestoDto } from './dto/update-solicitar-presupuesto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class SolicitarPresupuestoService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSolicitarPresupuestoDto: CreateSolicitarPresupuestoDto) {
    const usuarioSolicitante = await this.prisma.usuario.findUnique({
      where: { id: createSolicitarPresupuestoDto.usuarioSolicitanteId },
      include: {
        area: true,
      },
    });

    //1. Verificar si el usuario solicita presupuesto para su propia área
    if (usuarioSolicitante?.areaId !== createSolicitarPresupuestoDto.areaId) {
      throw new BadRequestException('No puedes solicitar presupuesto para otra área');
    }

    //2. Verificar si el usuario tiene presupuesto disponible
    const presupuestoDisponible = await this.prisma.presupuesto.findFirst({
      where: {
        areaId: createSolicitarPresupuestoDto.areaId,
        periodoId: createSolicitarPresupuestoDto.periodoId,
      },
    });

    if (!presupuestoDisponible) {
      throw new BadRequestException('No hay presupuesto disponible para este periodo');
    }

    // 3. Crear solicitud + ítems (en transacción)
    const solicitud = await this.prisma.$transaction(async (tx) => {
      const nuevaSolicitud = await tx.solicitudPresupuesto.create({
        data: {
          areaId: createSolicitarPresupuestoDto.areaId,
          periodoId: createSolicitarPresupuestoDto.periodoId,
          usuarioSolicitanteId: createSolicitarPresupuestoDto.usuarioSolicitanteId,
          estado: 'PENDIENTE',
          montoSolicitado: createSolicitarPresupuestoDto.montoSolicitado,
          justificacion: createSolicitarPresupuestoDto.justificacion,
        },
      });

      // Crear ítems
      await tx.articuloSolicitudPresupuesto.createMany({
        data: createSolicitarPresupuestoDto.articulos.map((item) => ({
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

  update(id: number, updateSolicitarPresupuestoDto: UpdateSolicitarPresupuestoDto) {
    return `This action updates a #${id} solicitarPresupuesto`;
  }

  remove(id: number) {
    return `This action removes a #${id} solicitarPresupuesto`;
  }
}
