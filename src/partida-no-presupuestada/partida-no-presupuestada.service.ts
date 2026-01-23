import { Injectable } from '@nestjs/common';
import { CreatePartidaNoPresupuestadaDto } from './dto/create-partida-no-presupuestada.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PartidaNoPresupuestadaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePartidaNoPresupuestadaDto) {
    return await this.prisma.$transaction(async (tx) => {
      const partidaNoPresupuestada = await tx.requisicion.create({
        data: {
          areaId: dto.areaId,
          proveedorId: dto.proveedorId ?? null,
          valorPresupuestado: dto.valorPresupuestado,
          ivaPresupuestado: dto.ivaPresupuestado ?? 0,
          justificacion: dto.justificacion,
          periodo: dto.periodo,
          usuarioId: dto.usuarioId,
          partidaNoPresupuestada: true,
        },
      });

      await tx.articuloRequisicion.create({
        data: {
          requisicionId: partidaNoPresupuestada.id,
          productoId: dto.productoId,
          cantidad: dto.cantidad,
          valorUnitario: dto.valorUnitario,
        },
      });

      return {
        data: partidaNoPresupuestada,
        message: 'Partida no presupuestada creada con éxito',
      };
    });
  }
}
