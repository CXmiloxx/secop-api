import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCuentasContableDto } from './dto/create-cuentas-contable.dto';
import { UpdateCuentasContableDto } from './dto/update-cuentas-contable.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CuentasContablesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCuentasContableDto: CreateCuentasContableDto) {
    const codigoExistente = await this.prisma.cuentaContable.findFirst({
      where: {
        codigo: createCuentasContableDto.codigo,
      },
    });

    if (codigoExistente) {
      throw new ConflictException(
        'El código de la cuenta contable ya existe, por favor ingrese otro código',
      );
    }
    const data = await this.prisma.cuentaContable.create({
      data: createCuentasContableDto,
    });

    return {
      data,
      message: 'Cuenta contable creada con exito',
    };
  }

  async findAll() {
    const cuentas = await this.prisma.cuentaContable.findMany();

    if (!cuentas || cuentas.length === 0) {
      throw new NotFoundException('No se encontraron cuentas contables');
    }

    return {
      data: cuentas,
      message: 'Cuentas contables obtenidas con exito',
    };
  }

  async findAllByTipoCuenta() {
    const tiposCuenta = await this.prisma.tipoCuentaContable.findMany();

    if (!tiposCuenta || tiposCuenta.length === 0) {
      throw new NotFoundException('No se encontraron tipos de cuenta contable');
    }

    return {
      data: tiposCuenta,
      message: 'Tipos de cuenta contable obtenidos con exito',
    };
  }

  async cuentasPermitidasByArea(areaId: number, periodo: number) {
    const solicitud = await this.prisma.solicitudPresupuesto.findFirst({
      where: {
        areaId,
        periodo,
        estado: 'APROBADO',
      },
      include: {
        articulos: {
          include: {
            conceptoContable: {
              include: {
                cuentaContable: true,
              },
            },
          },
        },
      },
    });

    if (!solicitud) return [];

    // eliminar duplicados
    const cuentasMap = new Map();

    solicitud.articulos.forEach((a) => {
      const cuenta = a.conceptoContable.cuentaContable;
      cuentasMap.set(cuenta.id, cuenta);
    });

    return {
      data: Array.from(cuentasMap.values()),
      message: 'Cuentas contables permitidas',
    };
  }

  async conceptosByCuentasContables() {
    const data = await this.prisma.cuentaContable.findMany({
      include: {
        conceptos: true,
      },
    });

    if (!data || data.length === 0) {
      throw new NotFoundException('No se encontraron cuentas contables');
    }

    return {
      data: data,
      message: 'Cuentas contables obtenidas con exito',
    };
  }

  async findOne(id: number) {
    const data = await this.prisma.cuentaContable.findUnique({
      where: { id },
    });
    return {
      data,
      message: 'Cuenta contable obtenida con exito',
    };
  }

  async update(id: number, updateCuentasContableDto: UpdateCuentasContableDto) {
    const data = await this.prisma.cuentaContable.update({
      where: { id },
      data: updateCuentasContableDto,
    });
    return {
      data,
      message: 'Cuenta contable actualizada con exito',
    };
  }

  async remove(id: number) {
    const data = await this.prisma.cuentaContable.delete({
      where: { id },
    });
    return {
      data,
      message: 'Cuenta contable eliminada con exito',
    };
  }
}
