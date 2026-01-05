import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}
  create(createProductoDto: CreateProductoDto) {
    return 'This action adds a new producto';
  }

  async findAll(id_concepto_contable: number) {
    const productos = await this.prisma.producto.findMany({
      where: {
        id_concepto_contable,
      },
    });

    if (!productos) {
      throw new NotFoundException('Productos no encontrados para el concepto ');
    }

    return {
      data: productos,
      message: 'Productos Obtenidos',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
