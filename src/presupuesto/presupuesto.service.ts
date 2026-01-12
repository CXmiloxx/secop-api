import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PresupuestoService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPresupuestoDto: CreatePresupuestoDto) {
    return await this.prisma.presupuesto.create({
      data: createPresupuestoDto,
    });
  }

  async findAll(periodo: number) {
    const data = await this.prisma.presupuesto.findMany({
      where: { periodo },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (data.length === 0) {
      throw new NotFoundException('No se encontraron presupuestos para el periodo ' + periodo);
    }

    return { data, message: 'Presupuestos obtenidos correctamente' };
  }

  async findOne(id: number) {
    return await this.prisma.presupuesto.findUnique({
      where: { id },
    });
  }

  async findByAreaId(areaId: number, periodo: number) {
    const data = await this.prisma.presupuesto.findFirst({
      where: { areaId, periodo },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`No se encontró presupuesto para del area el periodo ${periodo}`);
    }

    return {
      data,
      message: 'Presupuesto obtenido correctamente',
    };
  }

  async update(id: number, updatePresupuestoDto: UpdatePresupuestoDto) {
    return await this.prisma.presupuesto.update({
      where: { id },
      data: updatePresupuestoDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.presupuesto.delete({
      where: { id },
    });
  }
}
