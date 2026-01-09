import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequisicionDto } from './dto/create-requisicion.dto';
import { UpdateRequisicionDto } from './dto/update-requisicion.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class RequisicionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRequisicionDto) {
    const requisicion = await this.prisma.requisicion.create({
      data: {
        areaId: dto.areaId,
        proveedorId: dto.proveedorId ?? null,
        valorPresupuestado: dto.valorPresupuestado,
        ivaPresupuestado: dto.ivaPresupuestado ?? null,
        justificacion: dto.justificacion,
        periodo: dto.periodo,
      },
    });

    await this.prisma.articuloRequisicion.create({
      data: {
        requisicionId: requisicion.id,
        productoId: dto.productoId,
        cantidad: dto.cantidad,
        valorUnitario: dto.valorUnitario,
      },
    });

    await this.prisma.presupuesto.update({
      where: {
        areaId_periodo: {
          areaId: dto.areaId,
          periodo: dto.periodo,
        },
      },
      data: {
        saldoDisponible: { decrement: dto.valorPresupuestado },
        montoComprometido: { increment: dto.valorPresupuestado },
      },
    });

    return {
      data: requisicion,
      message: 'Requisicion creada con exito',
    };
  }

  async findAllByArea(areaId: number, periodo: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: {
        periodo,
        areaId,
      },
      include: {
        area: {
          select: {
            nombre: true,
          },
        },
        proveedor: {
          select: {
            nombre: true,
          },
        },
        articulos: {
          include: {
            producto: {
              select: {
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (requisiciones.length === 0) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo ' + periodo);
    }

    const data = requisiciones.map((req) => {
      const articulo = req.articulos[0];
      const valorTotal = articulo ? Number(articulo.cantidad) * Number(articulo.valorUnitario) : 0;

      return {
        area: req.area.nombre,
        fecha: req.createdAt.toISOString(),
        estado: req.estado,
        proveedor: req.proveedor?.nombre || 'Sin proveedor',
        cuenta: articulo?.producto.conceptoContable.cuentaContable.nombre || 'N/A',
        concepto: articulo?.producto.conceptoContable.nombre || 'N/A',
        producto: articulo?.producto.nombre || 'N/A',
        cantidad: articulo?.cantidad || 0,
        valor: valorTotal.toFixed(2),
        justificacion: req.justificacion,
        aprobadoPor: req.usuarioId ? `consultor el ${req.updatedAt.toISOString()}` : null,
        motivoRechazo: req.motivoRechazo || null,
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas con exito',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} requisicion`;
  }

  async update(id: number, updateRequisicionDto: UpdateRequisicionDto) {
    const data = await this.prisma.requisicion.update({
      where: { id },
      data: updateRequisicionDto,
    });
    return {
      data,
      message: 'Requisicion actualizada con exito',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} requisicion`;
  }
}
