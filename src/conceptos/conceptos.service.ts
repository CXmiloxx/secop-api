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

  remove(id: number) {
    return `This action removes a #${id} concepto`;
  }
}
