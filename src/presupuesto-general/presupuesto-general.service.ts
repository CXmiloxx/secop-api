import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePresupuestoGeneralDto } from './dto/create-presupuesto-general.dto';
import { UpdatePresupuestoGeneralDto } from './dto/update-presupuesto-general.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PresupuestoGeneralService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPresupuestoGeneralDto: CreatePresupuestoGeneralDto) {
    const presupuestoGeneral = await this.prisma.presupuestoGeneral.create({
      data: createPresupuestoGeneralDto,
    });
    return { data: presupuestoGeneral, message: 'Presupuesto general creado correctamente' };
  }

  async findAll(periodo: number) {
    const data = await this.prisma.presupuestoGeneral.findFirst({
      where: { periodo },
    });

    if (!data) {
      throw new NotFoundException('No se encontró presupuesto general para el periodo ' + periodo);
    }
    return { data, message: 'Presupuestos generales obtenidos correctamente' };
  }

  async findOne(id: number) {
    const presupuestoGeneral = await this.prisma.presupuestoGeneral.findUnique({
      where: { id },
    });
    return { data: presupuestoGeneral, message: 'Presupuesto general obtenido correctamente' };
  }

  async update(id: number, updatePresupuestoGeneralDto: UpdatePresupuestoGeneralDto) {
    const presupuestoGeneral = await this.prisma.presupuestoGeneral.update({
      where: { id },
      data: updatePresupuestoGeneralDto,
    });
    return { data: presupuestoGeneral, message: 'Presupuesto general actualizado correctamente' };
  }

  async remove(id: number) {
    const presupuestoGeneral = await this.prisma.presupuestoGeneral.delete({
      where: { id },
    });
    return { data: presupuestoGeneral, message: 'Presupuesto general eliminado correctamente' };
  }
}
