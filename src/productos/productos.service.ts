import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    const producto = await this.prisma.producto.create({
      data: createProductoDto,
    });
    return {
      data: producto,
      message: 'Producto creado con exito',
    };
  }

  async findAllByConceptoContable(conceptoContableId: number) {
    if (!conceptoContableId || isNaN(Number(conceptoContableId))) {
      throw new BadRequestException('El concepto contable no es valido');
    }
    const data = await this.prisma.producto.findMany({
      where: {
        conceptoContableId,
      },
    });

    if (!data || data.length === 0) {
      throw new NotFoundException(
        'No se encontraron productos para el concepto contable especificado',
      );
    }

    return {
      data,
      message: 'Productos obtenidos con éxito',
    };
  }

  async findAll() {
    const data = await this.prisma.producto.findMany();
    if (!data || data.length === 0) {
      throw new NotFoundException('No se encontraron productos');
    }
    return {
      data,
      message: 'Productos obtenidos con éxito',
    };
  }

  async productosPermitidosByConcepto(conceptoContableId: number) {
    const productos = await this.prisma.producto.findMany({
      where: {
        conceptoContableId,
      },
    });

    return {
      data: productos,
      message: 'Productos permitidos',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
    });
    return {
      data: producto,
      message: 'Producto actualizado con exito',
    };
  }

  async remove(id: number) {
    const producto = await this.prisma.producto.delete({
      where: { id },
    });
    return {
      data: producto,
      message: 'Producto eliminado con exito',
    };
  }
}
