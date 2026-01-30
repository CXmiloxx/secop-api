import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async historialCompras(fechaInicio?: Date, fechaFin?: Date, areaId?: number, proveedor?: string) {
    // filtro por tipos
    const where: any = {
      createdAt: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    if (areaId) {
      where.requisicion = {
        areaId: areaId,
      };
    }

    if (proveedor) {
      where.requisicion = {
        proveedor: {
          nombre: proveedor,
        },
      };
    }

    const comprasData = await this.prisma.pago.findMany({
      where,
      include: {
        requisicion: {
          include: {
            area: true,
            proveedor: true,
            articulo: {
              include: {
                producto: {
                  include: {
                    conceptoContable: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comprasData || comprasData.length === 0) {
      throw new NotFoundException('No se encontraron compras para los filtros especificados');
    }

    const totalCompras = comprasData.length;
    const totalValorPagado = comprasData.reduce((acc, compra) => acc + Number(compra.total), 0);

    const compras = comprasData.map((compra) => ({
      id: compra.id,
      fechaCompra: compra.createdAt,
      area: compra?.requisicion?.area?.nombre,
      proveedor: compra?.requisicion?.proveedor?.nombre,
      concepto: {
        nombre: compra?.requisicion?.articulo?.producto?.conceptoContable?.nombre,
        codigo: compra?.requisicion?.articulo?.producto?.conceptoContable?.codigo,
      },
      cantidad: compra?.requisicion?.articulo?.cantidad,
      justificacion: compra?.requisicion?.justificacion,
      valorPagado: compra.total,
    }));

    return {
      data: {
        totalCompras,
        totalValorPagado,
        compras,
      },
      message: 'Compras obtenidas con éxito',
    };
  }

  async historialComprasArea(
    areaId: number,
    fechaInicio?: Date,
    fechaFin?: Date,
    proveedor?: string,
  ) {
    // Corrige la estructura para filtrar por área correctamente
    const where: any = {
      requisicion: {
        areaId: areaId,
        ...(proveedor ? { proveedor: { nombre: proveedor } } : {}),
      },
      createdAt: {
        ...(fechaInicio ? { gte: fechaInicio } : {}),
        ...(fechaFin ? { lte: fechaFin } : {}),
      },
    };

    const comprasData = await this.prisma.pago.findMany({
      where,
      include: {
        requisicion: {
          include: {
            area: true,
            proveedor: true,
            articulo: {
              include: {
                producto: {
                  include: {
                    conceptoContable: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comprasData || comprasData.length === 0) {
      throw new NotFoundException('No se encontraron compras para los filtros especificados');
    }

    const totalCompras = comprasData.length;
    const totalValorPagado = comprasData.reduce((acc, compra) => acc + Number(compra.total), 0);

    const compras = comprasData.map((compra) => ({
      id: compra.id,
      fechaCompra: compra.createdAt,
      area: compra?.requisicion?.area?.nombre,
      proveedor: compra?.requisicion?.proveedor?.nombre,
      concepto: {
        nombre: compra?.requisicion?.articulo?.producto?.conceptoContable?.nombre,
        codigo: compra?.requisicion?.articulo?.producto?.conceptoContable?.codigo,
      },
      cantidad: compra?.requisicion?.articulo?.cantidad,
      justificacion: compra?.requisicion?.justificacion,
      valorPagado: compra.total,
    }));

    return {
      data: {
        totalCompras,
        totalValorPagado,
        compras,
      },
      message: 'Compras obtenidas con éxito',
    };
  }
}
