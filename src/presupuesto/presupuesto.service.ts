import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PresupuestoService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPresupuestoDto: CreatePresupuestoDto) {
    return await this.prisma.presupuesto.create({
      data: createPresupuestoDto,
    });
  }

  async findAll(periodo: number) {
    const data = await this.prisma.presupuesto.findMany({
      where: { periodo },
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
      throw new NotFoundException('No se encontraron presupuestos para el periodo ' + periodo);
    }

    return { data, message: 'Presupuestos obtenidos correctamente' };
  }

  async findOne(id: number) {
    return await this.prisma.presupuesto.findUnique({
      where: { id },
    });
  }

  async findByAreaId(areaId: number, periodo: number) {
    const data = await this.prisma.presupuesto.findFirst({
      where: { areaId, periodo },
      include: {
        area: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException(`No se encontró presupuesto para del area el periodo ${periodo}`);
    }

    return {
      data,
      message: 'Presupuesto obtenido correctamente',
    };
  }

  async findDetallesByArea(areaId: number, periodo: number) {
    // Buscar el presupuesto del área para el periodo
    const presupuestoArea = await this.prisma.presupuesto.findUnique({
      where: {
        areaId_periodo: {
          areaId,
          periodo,
        },
      },
      include: {
        area: {
          select: { nombre: true },
        },
      },
    });

    if (!presupuestoArea) {
      throw new NotFoundException(`No se encontró presupuesto para del area el periodo ${periodo}`);
    }

    // Trae aprobados por cuenta
    const aprobadoPorCuenta = await this.prisma.articuloSolicitudPresupuesto.groupBy({
      by: ['cuentaContableId'],
      where: {
        solicitud: {
          areaId,
          periodo,
          estado: 'APROBADO',
        },
      },
      _sum: {
        valorAprobado: true,
      },
    });

    // Obtener requisiciones pagadas con sus pagos y artículos
    const requisicionesPagadas = await this.prisma.requisicion.findMany({
      where: {
        areaId,
        periodo,
        estado: {
          not: {
            in: ['PENDIENTE', 'RECHAZADA'],
          },
        },
      },
      include: {
        pagos: {
          select: {
            total: true,
          },
        },
        articulo: {
          include: {
            producto: {
              include: {
                conceptoContable: {
                  include: {
                    cuentaContable: {
                      select: {
                        id: true,
                        nombre: true,
                        codigo: true,
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

    // Agrupar ejecutado por cuenta contable
    const ejecutadoPorCuentaMap = new Map<number, number>();

    for (const requisicion of requisicionesPagadas) {
      if (!requisicion.articulo) continue;

      const totalPago = requisicion.pagos.reduce((sum, pago) => sum + Number(pago.total), 0);

      if (totalPago === 0) continue;

      const cuentaContableId = requisicion.articulo.producto.conceptoContable.cuentaContable.id;

      const acumulado = ejecutadoPorCuentaMap.get(cuentaContableId) || 0;

      ejecutadoPorCuentaMap.set(cuentaContableId, acumulado + totalPago);
    }

    // IDs de cuentas contables involucradas
    const cuentaIds = [
      ...new Set([
        ...aprobadoPorCuenta.map((item) => item.cuentaContableId),
        ...Array.from(ejecutadoPorCuentaMap.keys()),
      ]),
    ];

    // Obtener los nombres y codigos de cuentas contables
    const cuentasContables = await this.prisma.cuentaContable.findMany({
      where: { id: { in: cuentaIds } },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
    });

    // Map de cuentas contables para búsqueda rápida
    const cuentasContablesMap = Object.fromEntries(cuentasContables.map((cc) => [cc.id, cc]));

    // Armar detalles
    const detalles = cuentaIds.map((cuentaId) => {
      const cuenta = cuentasContablesMap[cuentaId];
      const valorAprobado =
        aprobadoPorCuenta.find((item) => item.cuentaContableId === cuentaId)?._sum.valorAprobado ||
        0;
      const valorEjecutado = ejecutadoPorCuentaMap.get(cuentaId) || 0;
      const valorPorEjecutar = Number(valorAprobado) - Number(valorEjecutado);

      return {
        id: cuenta.id,
        cuentaContable: cuenta.nombre,
        codigo: cuenta.codigo,
        valorAprobado,
        valorEjecutado,
        valorPorEjecutar,
      };
    });

    // Estructura principal de retorno
    return {
      data: {
        id: presupuestoArea.id,
        area: presupuestoArea.area?.nombre || '',
        periodo: presupuestoArea.periodo,
        presupuestoAnual: presupuestoArea.presupuestoAnual,
        totalGastado: presupuestoArea.totalGastado,
        montoComprometido: presupuestoArea.montoComprometido,
        saldoDisponible: presupuestoArea.saldoDisponible,
        detalles,
      },
      message: 'Presupuesto obtenido correctamente',
    };
  }

  async update(id: number, updatePresupuestoDto: UpdatePresupuestoDto) {
    return await this.prisma.presupuesto.update({
      where: { id },
      data: updatePresupuestoDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.presupuesto.delete({
      where: { id },
    });
  }
}
