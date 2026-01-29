import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ConceptosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConceptoDto) {
    const codigoExistente = await this.prisma.conceptoContable.findFirst({
      where: {
        codigo: dto.codigo,
      },
    });

    if (codigoExistente) {
      throw new ConflictException(
        'El código del concepto contable ya existe, por favor ingrese otro código',
      );
    }
    const nombreExistente = await this.prisma.conceptoContable.findFirst({
      where: {
        nombre: dto.nombre,
      },
    });

    if (nombreExistente) {
      throw new ConflictException(
        'El nombre del concepto contable ya existe, por favor ingrese otro nombre',
      );
    }

    const data = await this.prisma.conceptoContable.create({
      data: {
        nombre: dto.nombre,
        codigo: dto.codigo,
        cuentaContableId: dto.cuentaContableId,
      },
    });

    const productos = await this.prisma.producto.createMany({
      data:
        dto.productos?.map((producto) => ({
          conceptoContableId: Number(data.id),
          nombre: producto.nombre,
          tipo: producto.tipo,
        })) || [],
    });

    if (!productos) {
      throw new NotFoundException('No se pudieron crear los productos');
    }

    return {
      data,
      message: 'Concepto contable creado con exito',
    };
  }

  async findPorCuenta(idCuentaContable: number) {
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

  async conceptosArticulosByCuenta(cuentaContableId: number) {
    const data = await this.prisma.conceptoContable.findMany({
      where: {
        cuentaContableId,
      },
      include: {
        productos: true,
      },
    });
    return {
      data,
      message: 'Conceptos contables y productos obtenidos con éxito',
    };
  }

  async findTotales() {
    const data = await this.prisma.conceptoContable.findMany();

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
      data: {
        nombre: updateConceptoDto.nombre,
        codigo: updateConceptoDto.codigo,
        cuentaContableId: updateConceptoDto.cuentaContableId,
      },
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
