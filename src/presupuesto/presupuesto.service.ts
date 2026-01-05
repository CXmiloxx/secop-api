import { Injectable } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { PrismaService } from '@prisma/prisma.service';
import { logger } from '@/common';

@Injectable()
export class PresupuestoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePresupuestoDto) {
    logger.log('entro');
    const presupuesto = await this.prisma.presupuesto.create({
      data: {
        id_area: dto.id_area,
        anio: new Date(dto.anio),
        justificacion: dto.justificacion,
        valor_solicitado: dto.valor_solicitado,
        porcentaje_aprobacion: 5,

        articulos_presupuestos: {
          create: dto.articulos_presupuestos.map((art) => ({
            id_cuenta_contable: art.id_cuenta_contable,
            id_concepto_contable: art.id_concepto_contable,
            id_producto_contable: art.id_producto_contable,
            cantidad: art.cantidad,
            valor_unitario: art.valor_unitario,
          })),
        },
      },
      include: {
        area: true,
        articulos_presupuestos: {
          include: {
            cuenta_contable: true,
            concepto_contable: true,
            producto_contable: true,
          },
        },
      },
    });

    return {
      message: 'Presupuesto creado correctamente',
      data: presupuesto,
    };
  }

  findAll() {
    return `This action returns all presupuesto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} presupuesto`;
  }

  update(id: number, updatePresupuestoDto: UpdatePresupuestoDto) {
    return `This action updates a #${id} presupuesto`;
  }

  remove(id: number) {
    return `This action removes a #${id} presupuesto`;
  }
}
