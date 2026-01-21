import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProviderDto) {
    const existingProvider = await this.prisma.proveedor.findUnique({
      where: { nit: dto.nit },
    });

    if (existingProvider) {
      throw new ConflictException('Proveedor con el nit ya existe');
    }

    const existingProviderByNombre = await this.prisma.proveedor.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existingProviderByNombre) {
      throw new ConflictException('Proveedor con el nombre ' + dto.nombre + ' ya existe');
    }

    const provider = await this.prisma.proveedor.create({
      data: dto,
    });

    return {
      data: provider,
      message: 'Proveedor creado con exito',
    };
  }

  async findAll() {
    const all = await this.prisma.proveedor.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
    if (all.length === 0) {
      throw new NotFoundException('No se encontraron proveedores');
    }
    return {
      data: all,
      message: 'Proveedores obtenidos con exito ',
    };
  }

  async findOne(id: number) {
    const provider = await this.prisma.proveedor.findUnique({
      where: {
        id,
      },
    });
    if (!provider) {
      throw new NotFoundException('No se encontró el proveedor');
    }
    return {
      data: provider,
      message: 'Proveedor obtenido con exito',
    };
  }

  async update(id: number, updateProviderDto: UpdateProviderDto) {
    const provider = await this.prisma.proveedor.update({
      where: {
        id,
      },
      data: {
        ...updateProviderDto,
      },
    });

    return {
      data: provider,
      message: 'Proveedor actualizado correctamente ',
    };
  }

  async remove(id: number) {
    const provider = await this.prisma.proveedor.delete({
      where: {
        id,
      },
    });
    if (!provider) {
      throw new NotFoundException('No se encontró el proveedor');
    }
    return {
      data: null,
      message: 'Proveedor eliminado con exito',
    };
  }
}
