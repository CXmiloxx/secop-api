import { Injectable } from '@nestjs/common';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ConceptosService {
  constructor(private readonly prisma: PrismaService) {}
  create(createConceptoDto: CreateConceptoDto) {
    return 'This action adds a new concepto';
  }

  async findAll(idCuentaContable: number) {
    const data = await this.prisma.concepto_contable.findMany({
      where: {
        id_cuenta_contable: idCuentaContable,
      },
    });
    return {
      data,
      message: 'Cunetas contables obtendias con exito',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} concepto`;
  }

  update(id: number, updateConceptoDto: UpdateConceptoDto) {
    return `This action updates a #${id} concepto`;
  }

  remove(id: number) {
    return `This action removes a #${id} concepto`;
  }
}
