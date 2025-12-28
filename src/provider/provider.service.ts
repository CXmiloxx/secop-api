import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProviderDto: CreateProviderDto) {
    const provider = await this.prisma.proveedor.create({
      data: { ...createProviderDto },
    });

    return {
      data: provider,
      message: 'Proveedor creado con exito',
    };
  }

  async findAll() {
    const all = await this.prisma.proveedor.findMany();
    if (!all) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return {
      data: all,
      message: 'Proveedores obtenidos con exito ',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} provider`;
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

  remove(id: number) {
    return `This action removes a #${id} provider`;
  }
}
