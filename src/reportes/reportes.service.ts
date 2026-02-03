import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  private validateDates(fechaInicio?: Date, fechaFin?: Date) {
    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser menor a la fecha de fin');
    }

    return {
      where: {
        createdAt: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
    };
  }

  async reporteProveedores(fechaInicio?: Date, fechaFin?: Date) {
    const { where } = this.validateDates(fechaInicio, fechaFin);
    const rows = await this.prisma.calificacionProveedor.findMany({
      where,
      include: {
        proveedor: true,
        requisicion: {
          include: {
            articulo: true,
            pagos: true,
          },
        },
      },
    });

    if (rows.length === 0) {
      throw new NotFoundException('No se encontraron reportes para el periodo seleccionado');
    }

    const map = new Map<
      number,
      {
        proveedorId: number;
        proveedor: string;
        cantidadProductos: number;
        valorTotal: number;
        totalCalificacion: number;
        cantidadRegistros: number;
      }
    >();

    for (const row of rows) {
      const proveedorId = row.proveedorId;

      const cantidad = Number(row.requisicion.articulo?.cantidad ?? 0);

      const valorPagado = row.requisicion.pagos.reduce((sum, p) => sum + Number(p.total), 0);

      const promedioFila =
        (row.precio +
          row.puntualidad +
          row.tiempoGarantia +
          row.tiempoEntrega +
          row.calidadProducto) /
        5;

      if (!map.has(proveedorId)) {
        map.set(proveedorId, {
          proveedorId,
          proveedor: row.proveedor.nombre,
          cantidadProductos: cantidad,
          valorTotal: valorPagado,
          totalCalificacion: promedioFila,
          cantidadRegistros: 1,
        });
      } else {
        const acc = map.get(proveedorId)!;

        acc.cantidadProductos += cantidad;
        acc.valorTotal += valorPagado;
        acc.totalCalificacion += promedioFila;
        acc.cantidadRegistros += 1;
      }
    }

    return Array.from(map.values()).map((r) => ({
      proveedorId: r.proveedorId,
      proveedor: r.proveedor,
      cantidadProductos: r.cantidadProductos,
      valorTotal: r.valorTotal,
      calificacionPromedio:
        r.cantidadRegistros === 0
          ? 0
          : Number((r.totalCalificacion / r.cantidadRegistros).toFixed(2)),
    }));
  }

  async reporteConsultor(fechaInicio?: Date, fechaFin?: Date) {
    const { where } = this.validateDates(fechaInicio, fechaFin);

    const rows = await this.prisma.calificacionConsultor.findMany({
      where,
      include: {
        requisicion: {
          include: {
            area: true,
            proveedor: true,
            articulo: {
              include: {
                producto: true,
              },
            },
            pagos: true,
          },
        },
        consultor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!rows.length) {
      throw new NotFoundException('No se encontraron reportes para el periodo seleccionado');
    }

    const reporte = rows.map((row) => {
      const valor = row.requisicion.pagos.reduce((sum, p) => sum + Number(p.total), 0);
      const calificacion = (row.calidadProducto + row.tiempoEntrega) / 2;
      return {
        area: row.requisicion.area.nombre,
        valor,
        calidadProducto: row.calidadProducto,
        tiempoEntrega: row.tiempoEntrega,
        calificacion,
        comentario: row.comentario ?? '',
        fecha: row.createdAt,
        producto: row.requisicion.articulo?.producto?.nombre ?? 'Sin producto',
      };
    });

    const distribucionCalificaciones = reporte.reduce(
      (acc, row) => {
        acc.calidadProducto[row.calidadProducto] =
          (acc.calidadProducto[row.calidadProducto] || 0) + 1;
        acc.tiempoEntrega[row.tiempoEntrega] = (acc.tiempoEntrega[row.tiempoEntrega] || 0) + 1;
        return acc;
      },
      {
        calidadProducto: {} as Record<number, number>,
        tiempoEntrega: {} as Record<number, number>,
      },
    );

    const totalCalificaciones = reporte.reduce(
      (sum, row) => sum + row.calidadProducto + row.tiempoEntrega,
      0,
    );
    const cantidadRatings = reporte.length * 2;
    const calificacionPromedio = totalCalificaciones / cantidadRatings;

    const calificaciones = {
      distribucionCalificaciones,
      calificacionPromedio,
      totalCalificaciones,
    };

    return {
      data: {
        calificaciones,
        reporte,
      },
      message: 'Reporte de calificaciones de consultor obtenido correctamente',
    };
  }

  async reporteTesoreria(fechaInicio?: Date, fechaFin?: Date) {
    const { where } = this.validateDates(fechaInicio, fechaFin);

    const rows = await this.prisma.calificacionTesoreria.findMany({
      where,
      include: {
        requisicion: {
          include: {
            area: true,
            proveedor: true,
          },
        },
        pago: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!rows.length) {
      throw new NotFoundException('No se encontraron reportes para el periodo seleccionado');
    }

    const reporte = rows.map((row) => ({
      requisicion: row.requisicionId,
      area: row.requisicion.area.nombre,
      proveedor: row.requisicion.proveedor?.nombre ?? 'Sin proveedor',
      valor: Number(row.pago.total),
      calificacion: row.pagoOportuno,
      comentario: row.comentario ?? '',
      fecha: row.createdAt,
    }));

    const totalCalificaciones = reporte.reduce((sum, row) => sum + Number(row.calificacion), 0);
    const calificacionPromedio = totalCalificaciones / reporte.length;
    const distribucionCalificaciones = reporte.reduce(
      (acc, row) => {
        acc[row.calificacion] = (acc[row.calificacion] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const calificaciones = {
      distribucionCalificaciones,
      calificacionPromedio,
      totalCalificaciones,
    };

    return {
      data: {
        calificaciones,
        reporte,
      },
      message: 'Reporte de calificaciones de tesoreria obtenido correctamente',
    };
  }

  async reportePresupuestos(fechaInicio?: Date, fechaFin?: Date) {
    // filtro por tipos
    const { where } = this.validateDates(fechaInicio, fechaFin);
    const data = await this.prisma.presupuesto.findMany({
      where,
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (data.length === 0) {
      throw new NotFoundException('No se encontraron reportes para el periodo seleccionado');
    }

    return { data, message: 'Presupuestos obtenidos correctamente' };
  }

  async reportePresupuestoGeneral(fechaInicio?: Date, fechaFin?: Date) {
    const { where } = this.validateDates(fechaInicio, fechaFin);
    const data = await this.prisma.presupuestoGeneral.findFirst({
      where,
    });

    if (!data) {
      throw new NotFoundException(
        'No se encontraron presupuestos generales para el periodo seleccionado',
      );
    }

    return { data, message: 'Reporte de presupuestos generales obtenido correctamente' };
  }

  async reportePartidaNoPresupuestada(fechaInicio?: Date, fechaFin?: Date) {
    const { where } = this.validateDates(fechaInicio, fechaFin);
    const data = await this.prisma.requisicion.findMany({
      where: {
        ...where,
        partidaNoPresupuestada: true,
        estado: {
          not: 'PENDIENTE',
        },
      },
      include: {
        area: true,
        proveedor: true,
        articulo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!data) {
      throw new NotFoundException('No se encontraron requisiciones para el periodo seleccionado');
    }

    const totales = {
      valorTotal: data.reduce((sum, row) => sum + Number(row.valorDefinido ?? 0), 0),
      partidasTotales: data.length,
    };

    const reporte = data.map((row) => ({
      numeroComite: row.numeroComite,
      justificacion: row.justificacion,
      valorUnitario: Number(row.articulo?.valorUnitario ?? 0),
      area: row.area.nombre,
      proveedor: row.proveedor?.nombre ?? 'Sin proveedor',
      valorTotal: Number(row.valorDefinido),
      fecha: row.createdAt,
      estado: row.estado,
      cantidad: Number(row.articulo?.cantidad ?? 0),
    }));

    return {
      data: {
        totales,
        reporte,
      },
      message: 'Reporte de partida no presupuestada obtenido correctamente',
    };
  }
}
