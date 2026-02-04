import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { PrismaService } from '@prisma/prisma.service';
import { ModificarDetalleProductoDto } from './dto/modificar-producto.dto';
import { EstadoActivo } from '@/generated/prisma/enums';
import { logger } from '@/common';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  private buildInventarioWhere(
    areaId?: number,
    nombreProducto?: string,
    estadoActivo?: EstadoActivo,
    conceptoId?: number,
  ) {
    const where: any = {};

    if (areaId !== undefined) {
      where.areaId = Number(areaId);
    }

    if (nombreProducto || estadoActivo || conceptoId) {
      where.producto = {};

      if (nombreProducto) {
        where.producto.nombre = {
          contains: nombreProducto,
        };
      }

      if (estadoActivo) {
        where.producto.estado = estadoActivo;
      }

      if (conceptoId) {
        where.producto.conceptoContableId = Number(conceptoId);
      }
    }

    return where;
  }

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
            stockMinimo: 1,
            ubicacion,
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

  async inventarioGeneral(
    areaId?: number,
    nombreProducto?: string,
    conceptoId?: number,
    estadoActivo?: EstadoActivo,
  ) {
    const where = this.buildInventarioWhere(areaId, nombreProducto, estadoActivo, conceptoId);

    const inventarioAreas = await this.prisma.inventarioArea.findMany({
      where,
      select: {
        stockActual: true,
        productoId: true,
        ubicacion: true,
        producto: {
          select: {
            nombre: true,
            tipo: true,
            estado: true,
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
      throw new NotFoundException(
        'No se encontraron productos en el inventario con los filtros proporcionados',
      );
    }

    logger.debug(JSON.stringify(inventarioAreas), 'InventarioService');

    const productosMap = new Map<number, any>();

    for (const item of inventarioAreas) {
      const productoId = item.productoId;

      if (!productosMap.has(productoId)) {
        productosMap.set(productoId, {
          id: productoId,
          nombre: item.producto.nombre,
          tipo: item.producto.tipo,
          estado: item.producto.estado,
          categoria: item.producto.conceptoContable.nombre,
          cantidad: 0,
          areas: areaId ? undefined : new Set<string>(),
          area: areaId ? item.area.nombre : undefined,
          ubicacion: item.ubicacion,
        });
      }

      const producto = productosMap.get(productoId);

      producto.cantidad += Number(item.stockActual);
      if (!areaId) {
        producto.areas?.add(item.area.nombre);
      }
    }

    const productos = Array.from(productosMap.values()).map((p) => ({
      ...p,
      areas: p.areas ? Array.from(p.areas) : undefined,
    }));

    return {
      data: {
        totalProductos: productos.length,
        totalUnidades: productos.reduce((sum, p) => sum + p.cantidad, 0),
        productos,
      },
      message: 'Inventario general obtenido correctamente',
    };
  }

  async inventarioArea(
    areaId: number,
    nombreProducto?: string,
    conceptoId?: number,
    estadoActivo?: EstadoActivo,
  ) {
    const where = this.buildInventarioWhere(areaId, nombreProducto, estadoActivo, conceptoId);

    const inventarioAreas = await this.prisma.inventarioArea.findMany({
      where,
      select: {
        stockActual: true,
        stockMinimo: true,
        ubicacion: true,
        productoId: true,
        areaId: true,
        producto: {
          select: {
            nombre: true,
            tipo: true,
            estado: true,
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
      throw new NotFoundException('No se encontraron productos en el inventario general');
    }

    const productosMap = new Map<number, any>();

    for (const item of inventarioAreas) {
      const productoId = item.productoId;

      if (!productosMap.has(productoId)) {
        productosMap.set(productoId, {
          id: productoId,
          nombre: item.producto.nombre,
          tipo: item.producto.tipo,
          estado: item.producto.estado,
          categoria: item.producto.conceptoContable.nombre,
          stockMinimo: Number(item.stockMinimo),
          cantidad: Number(item.stockActual),
          areaId: item.areaId,
          area: item.area.nombre,
          ubicacion: item.ubicacion,
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
      message: 'Inventario del área obtenido correctamente',
    };
  }

  async modificarDetalleProducto(dto: ModificarDetalleProductoDto) {
    const inventarioArea = await this.prisma.inventarioArea.findUnique({
      where: { areaId_productoId: { areaId: dto.areaId, productoId: dto.productoId } },
    });

    if (!inventarioArea) {
      throw new NotFoundException('No se encontró el producto en el inventario del área');
    }

    await this.prisma.inventarioArea.update({
      where: { id: inventarioArea.id },
      data: { stockMinimo: Number(dto.stockMinimo), ubicacion: dto.ubicacion },
    });

    return {
      data: {
        stockMinimo: dto.stockMinimo,
        ubicacion: dto.ubicacion,
      },
      message: 'Detalle del producto modificado correctamente',
    };
  }
}
