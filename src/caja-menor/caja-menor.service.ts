import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateCajaMenorDto } from './dto/create-caja-menor.dto';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { TipoMovimientoCajaMenor } from '@/generated/prisma/enums';
import { AprobarPresupuestoDto } from './dto/aprobar-presupuesto.dto';

@Injectable()
export class CajaMenorService {
  constructor(private readonly prisma: PrismaService) {}

  async solicitarReposicionCajaMenor(dto: {
    cajaMenorId: number;
    montoSolicitado: number;
    justificacion?: string;
  }) {
    const caja = await this.prisma.cajaMenor.findUnique({
      where: { id: dto.cajaMenorId },
    });

    if (!caja) throw new NotFoundException('Caja menor no encontrada');

    const futuroAsignado = Number(caja.presupuestoAsignado) + Number(dto.montoSolicitado);

    if (futuroAsignado > Number(caja.topeMaximo)) {
      throw new BadRequestException('La solicitud supera el tope máximo');
    }

    return this.prisma.solicitudReposicionCajaMenor.create({
      data: {
        cajaMenorId: caja.id,
        montoSolicitado: dto.montoSolicitado,
        justificacion: dto.justificacion,
        estado: 'PENDIENTE',
      },
    });
  }

  async aprobarReposicionCajaMenor(dto: AprobarPresupuestoDto) {
    return this.prisma.$transaction(async (tx) => {
      const solicitud = await tx.solicitudReposicionCajaMenor.findUnique({
        where: { id: dto.solicitudId },
        include: { cajaMenor: true },
      });

      if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

      if (solicitud.estado !== 'PENDIENTE')
        throw new BadRequestException('La solicitud ya fue procesada');

      const caja = solicitud.cajaMenor;

      const nuevoAsignado = Number(caja.presupuestoAsignado) + Number(dto.montoAprobado);

      if (nuevoAsignado > Number(caja.topeMaximo)) {
        throw new BadRequestException('La reposición supera el tope máximo');
      }

      await tx.solicitudReposicionCajaMenor.update({
        where: { id: solicitud.id },
        data: {
          estado: 'APROBADO',
          montoAprobado: dto.montoAprobado,
          justificacion: dto.justificacion,
          fechaAprobacion: new Date(),
        },
      });

      await tx.cajaMenor.update({
        where: { id: caja.id },
        data: {
          presupuestoAsignado: {
            increment: dto.montoAprobado,
          },
        },
      });

      return { message: 'Reposición aprobada correctamente' };
    });
  }

  async asignarPresupuestoDirecto(cajaMenorId: number, monto: number, justificacion?: string) {
    return this.prisma.$transaction(async (tx) => {
      const caja = await tx.cajaMenor.findUnique({
        where: { id: cajaMenorId },
      });

      if (!caja) throw new NotFoundException('Caja menor no encontrada');

      const nuevoAsignado = Number(caja.presupuestoAsignado) + monto;

      if (nuevoAsignado > Number(caja.topeMaximo)) {
        throw new BadRequestException('La asignación supera el tope máximo');
      }

      // 1️⃣ Crear solicitud YA APROBADA
      await tx.solicitudReposicionCajaMenor.create({
        data: {
          cajaMenorId: caja.id,
          montoSolicitado: monto,
          montoAprobado: monto,
          estado: 'APROBADO',
          justificacion: justificacion ?? 'Asignación directa por encargado',
          fechaAprobacion: new Date(),
        },
      });

      // 2️⃣ Impactar la caja menor
      await tx.cajaMenor.update({
        where: { id: caja.id },
        data: {
          presupuestoAsignado: { increment: monto },
        },
      });

      return { message: 'Presupuesto asignado correctamente' };
    });
  }

  async create(dto: CreateCajaMenorDto) {
    if (dto.topeMaximo < dto.presupuestoAsignado) {
      throw new BadRequestException('El tope máximo no puede ser menor al presupuesto asignado');
    }

    const cajaMenorExistente = await this.prisma.cajaMenor.findFirst({
      where: { periodo: dto.periodo },
    });

    if (cajaMenorExistente) {
      throw new BadRequestException('Ya existe una caja menor para el periodo ' + dto.periodo);
    }

    const cajaMenor = await this.prisma.cajaMenor.create({
      data: {
        periodo: dto.periodo,
        topeMaximo: dto.topeMaximo,
        presupuestoAsignado: dto.presupuestoAsignado,
        presupuestoGastado: 0,
      },
    });

    return {
      data: cajaMenor,
      message: 'Caja menor creada con exito',
    };
  }

  async findAll(periodo: number) {
    const data = await this.prisma.cajaMenor.findUnique({
      where: { periodo },
    });

    if (!data) {
      throw new NotFoundException(
        'No se encontró presupuesto de caja menor para el periodo ' + periodo,
      );
    }

    const saldoDisponible = Number(data.presupuestoAsignado) - Number(data.presupuestoGastado);

    return {
      data: { ...data, saldoDisponible },
      message: 'Presupuesto de caja menor obtenido correctamente',
    };
  }

  async historialCajaMenor(cajaMenorId: number) {
    const data = await this.prisma.cajaMenorMovimiento.findMany({
      where: { cajaMenorId },
      include: {
        proveedor: {
          select: {
            nombre: true,
          },
        },
        cuentaContable: {
          select: {
            nombre: true,
          },
        },
        conceptoContable: {
          select: {
            nombre: true,
          },
        },
        area: {
          select: {
            nombre: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('No se encontró historial de movimientos de la caja menor ');
    }

    const formattedData = data.map((item) => ({
      ...item,
      proveedor: item.proveedor?.nombre ?? null,
      cuentaContable: item.cuentaContable?.nombre ?? null,
      conceptoContable: item.conceptoContable?.nombre ?? null,
      area: item.area?.nombre ?? null,
      fecha: item.createdAt.toISOString(),
      areaSolicitante: item.area?.nombre ?? null,
      descripcionProducto: item.descripcionProducto ?? null,
    }));

    return {
      data: formattedData,
      message: 'Historial de movimientos de la caja menor obtenido correctamente',
    };
  }

  async findOne(id: number) {
    return this.prisma.cajaMenor.findUnique({
      where: { id },
    });
  }

  async update(id: number, dto: any) {
    return this.prisma.cajaMenor.update({
      where: { id },
      data: dto,
    });
  }

  async registrarGastoCajaMenor(
    dto: CrearMovimientoDto,
    soporteFactura: Express.Multer.File | undefined,
  ) {
    {
      return this.prisma.$transaction(async (tx) => {
        const caja = await tx.cajaMenor.findUnique({
          where: { id: Number(dto.cajaMenorId) },
        });

        if (!caja) throw new NotFoundException('Caja menor no encontrada');

        const saldoDisponible = Number(caja.presupuestoAsignado) - Number(caja.presupuestoGastado);

        if (saldoDisponible < Number(dto.valorTotal)) {
          throw new BadRequestException('Saldo insuficiente en caja menor');
        }

        await tx.cajaMenorMovimiento.create({
          data: {
            cajaMenorId: caja.id,
            areaId: dto.areaId ? Number(dto.areaId) : null,
            proveedorId: dto.proveedorId ? Number(dto.proveedorId) : null,
            cuentaContableId: dto.cuentaContableId ? Number(dto.cuentaContableId) : null,
            conceptoContableId: dto.conceptoContableId ? Number(dto.conceptoContableId) : null,
            cantidad: Number(dto.cantidad ?? null),
            valorBase: Number(dto.valorBase ?? null),
            descripcionProducto: dto.descripcionProducto ?? null,
            justificacion: dto.justificacion ?? null,
            iva: dto.iva ? Number(dto.iva) : 0,
            tipo: TipoMovimientoCajaMenor.GASTO,
            soporte: soporteFactura?.path ?? null,
            valorTotal: Number(dto.valorTotal ?? null),
          },
        });

        await tx.cajaMenor.update({
          where: { id: caja.id },
          data: {
            presupuestoGastado: {
              increment: Number(dto.valorTotal),
            },
          },
        });

        return { message: 'Gasto registrado correctamente' };
      });
    }
  }

  async remove(id: number) {
    return this.prisma.cajaMenor.delete({
      where: { id },
    });
  }
}
