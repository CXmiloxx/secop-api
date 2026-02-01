import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInventarioDto) {
    const { requisicionId, areaId, cantidad, consultorId, productoId, ubicacion } = dto;

    const result = await this.prisma.$transaction(async (prisma) => {
      // Validar artículo de la requisición
      const articulo = await prisma.articuloRequisicion.findUnique({
        where: { requisicionId },
      });

      if (!articulo) {
        throw new Error('La requisición no tiene artículo asociado');
      }

      if (Number(cantidad) > Number(articulo.cantidad)) {
        throw new Error('La cantidad ingresada no puede ser mayor a la solicitada');
      }

      // Movimiento
      const movimientoInventario = await prisma.movimientoInventario.create({
        data: {
          areaId,
          productoId,
          requisicionId,
          tipo: 'INGRESO',
          cantidad: Number(cantidad),
          usuarioId: consultorId,
          ubicacion,
        },
      });

      // Inventario por área
      const inventario = await prisma.inventarioArea.findUnique({
        where: {
          areaId_productoId: { areaId, productoId },
        },
      });

      if (inventario) {
        await prisma.inventarioArea.update({
          where: { id: inventario.id },
          data: { stockActual: { increment: Number(cantidad) } },
        });
      } else {
        await prisma.inventarioArea.create({
          data: {
            areaId,
            productoId,
            stockActual: Number(cantidad),
          },
        });
      }

      // Estado requisición
      await prisma.requisicion.update({
        where: { id: requisicionId },
        data: { estado: 'EN_INVENTARIO' },
      });

      return movimientoInventario;
    });

    return {
      data: result,
      message: 'Producto ingresado al inventario correctamente',
    };
  }

  async requisicionesPendientesInventario(periodo: number) {
    const requisiciones = await this.prisma.requisicion.findMany({
      where: { periodo, estado: 'PENDIENTE_ENTREGA' },
      include: {
        area: {
          select: { id: true, nombre: true },
        },
        cotizaciones: {
          select: {
            soporteCotizacionPath: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        proveedor: {
          select: { nombre: true },
        },
        articulo: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
                conceptoContable: {
                  select: {
                    nombre: true,
                    cuentaContable: {
                      select: { nombre: true },
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
      throw new NotFoundException(
        'No se encontraron requisiciones pendientes de inventario para el periodo: ' + periodo,
      );
    }

    const data = requisiciones.map((req) => {
      const articulo = req?.articulo;

      return {
        id: req.id,
        area: {
          id: req.area.id,
          nombre: req.area.nombre,
        },
        producto: {
          id: articulo?.producto.id,
          nombre: articulo?.producto.nombre,
        },
        cantidad: articulo?.cantidad,
        numeroComite: req.numeroComite,
      };
    });

    return {
      data,
      message: 'Requisiciones obtenidas exitosamente',
    };
  }

  async historialMovimientos() {
    const historialMovimientos = await this.prisma.movimientoInventario.findMany({
      where: {
        tipo: 'INGRESO',
      },
      select: {
        id: true,
        createdAt: true,
        cantidad: true,
        tipo: true,
        producto: { select: { nombre: true } },
        area: { select: { nombre: true } },
      },
    });

    if (historialMovimientos.length === 0) {
      throw new NotFoundException('No se encontraron movimientos en el inventario');
    }

    const data = historialMovimientos.map((movimiento) => ({
      id: movimiento.id,
      fechaIngreso: movimiento.createdAt.toISOString(),
      cantidad: movimiento.cantidad,
      tipo: movimiento.tipo,
      producto: movimiento.producto.nombre,
      area: movimiento.area.nombre,
    }));

    return {
      data,
      message: 'Historial de movimientos obtenido correctamente',
    };
  }

  async inventarioGeneral() {
    const inventarioAreas = await this.prisma.inventarioArea.findMany({
      select: {
        stockActual: true,
        productoId: true,
        producto: {
          select: {
            nombre: true,
            conceptoContable: {
              select: { nombre: true },
            },
          },
        },
        area: {
          select: { nombre: true },
        },
      },
    });

    if (inventarioAreas.length === 0) {
      throw new NotFoundException('No se encontraron productos en el inventario');
    }

    const productosMap = new Map<number, any>();

    for (const item of inventarioAreas) {
      const productoId = item.productoId;

      if (!productosMap.has(productoId)) {
        productosMap.set(productoId, {
          id: productoId,
          nombre: item.producto.nombre,
          categoria: item.producto.conceptoContable.nombre,
          cantidad: 0,
          areas: new Set<string>(),
        });
      }

      const producto = productosMap.get(productoId);

      producto.cantidad += Number(item.stockActual);
      producto.areas.add(item.area.nombre);
    }

    const productos = Array.from(productosMap.values()).map((p) => ({
      ...p,
      areas: Array.from(p.areas),
    }));

    const data = {
      totalProductos: productos.length,
      totalUnidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
      productos,
    };

    return {
      data,
      message: 'Inventario general obtenido correctamente',
    };
  }

  async inventarioArea(areaId: number) {
    const inventarioAreas = await this.prisma.inventarioArea.findMany({
      where: { areaId },
      select: {
        stockActual: true,
        stockMinimo: true,
        productoId: true,
        producto: {
          select: {
            nombre: true,
            conceptoContable: {
              select: { nombre: true },
            },
          },
        },
      },
    });

    if (inventarioAreas.length === 0) {
      throw new NotFoundException('No se encontraron productos en el inventario');
    }

    const productosMap = new Map<number, any>();

    for (const item of inventarioAreas) {
      const productoId = item.productoId;

      if (!productosMap.has(productoId)) {
        productosMap.set(productoId, {
          id: productoId,
          nombre: item.producto.nombre,
          categoria: item.producto.conceptoContable.nombre,
          stockMinimo: Number(item.stockMinimo),
          cantidad: Number(item.stockActual),
        });
      }
    }

    const productos = Array.from(productosMap.values());

    const data = {
      totalProductos: productos.length,
      totalUnidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
      productos,
    };

    return {
      data,
      message: 'Inventario general obtenido correctamente',
    };
  }

  update(id: number, dto: UpdateInventarioDto) {
    return `This action updates a #${id} inventario ${JSON.stringify(dto)}`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventario`;
  }
}
