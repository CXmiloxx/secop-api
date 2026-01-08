import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AreasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAreaDto: CreateAreaDto) {
    const area = await this.prisma.area.create({
      data: createAreaDto,
    });
    return {
      data: area,
      message: 'Area creada correctamente',
    };
  }

  async findAll() {
    const data = await this.prisma.area.findMany();
    if (!data) {
      throw new NotFoundException('No se encontraron areas');
    }
    return {
      data,
      message: 'Areas obtenidas correctamente',
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.area.findUnique({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('No se encontró la area');
    }
    return {
      data,
      message: 'Area obtenida correctamente',
    };
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.prisma.area.update({
      where: { id },
      data: updateAreaDto,
    });

    if (!area) {
      throw new NotFoundException('No se encontró la area');
    }
    return {
      data: area,
      message: 'Area actualizada correctamente',
    };
  }

  async remove(id: number) {
    const area = await this.prisma.area.delete({
      where: { id },
    });
    return {
      data: area,
      message: 'Area eliminada correctamente',
    };
  }
}
