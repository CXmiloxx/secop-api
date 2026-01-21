import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ConceptosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createConceptoDto: CreateConceptoDto) {
    const data = await this.prisma.conceptoContable.create({
      data: createConceptoDto,
    });
    return {
      data,
      message: 'Concepto contable creado con exito',
    };
  }

  async findAll(idCuentaContable: number) {
    if (!idCuentaContable || isNaN(Number(idCuentaContable))) {
      throw new BadRequestException('La cuenta contable no es valida');
    }

    const data = await this.prisma.conceptoContable.findMany({
      where: {
        cuentaContableId: idCuentaContable,
      },
    });

    if (!data || data.length === 0) {
      throw new NotFoundException(
        'No se encontraron conceptos contables para la cuenta especificada',
      );
    }

    return {
      data,
      message: 'Conceptos contables obtenidos con éxito',
    };
  }

  async conceptosPermitidosByCuenta(areaId: number, periodo: number, cuentaContableId: number) {
    const solicitud = await this.prisma.solicitudPresupuesto.findFirst({
      where: {
        areaId,
        periodo,
        estado: 'APROBADO',
      },
      include: {
        articulos: {
          include: {
            conceptoContable: true,
          },
        },
      },
    });

    if (!solicitud) return [];

    const conceptosMap = new Map();

    solicitud.articulos.forEach((a) => {
      if (a.conceptoContable.cuentaContableId === cuentaContableId) {
        conceptosMap.set(a.conceptoContable.id, a.conceptoContable);
      }
    });

    return {
      data: Array.from(conceptosMap.values()),
      message: 'Conceptos contables permitidos',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} concepto`;
  }

  async update(id: number, updateConceptoDto: UpdateConceptoDto) {
    const data = await this.prisma.conceptoContable.update({
      where: { id },
      data: updateConceptoDto,
    });
    return {
      data,
      message: 'Concepto contable actualizado con exito',
    };
  }

  async remove(id: number) {
    const data = await this.prisma.conceptoContable.delete({
      where: { id },
    });
    if (!data) {
      throw new NotFoundException('No se encontró el concepto contable');
    }
    return {
      data: null,
      message: 'Concepto contable eliminado con exito',
    };
  }
}
