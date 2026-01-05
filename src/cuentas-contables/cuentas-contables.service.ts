import { Injectable } from '@nestjs/common';
import { CreateCuentasContableDto } from './dto/create-cuentas-contable.dto';
import { UpdateCuentasContableDto } from './dto/update-cuentas-contable.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class CuentasContablesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCuentasContableDto: CreateCuentasContableDto) {
    return 'This action adds a new cuentasContable';
  }

  async findAll() {
    return await this.prisma.cuenta_contable.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} cuentasContable`;
  }

  update(id: number, updateCuentasContableDto: UpdateCuentasContableDto) {
    return `This action updates a #${id} cuentasContable`;
  }

  remove(id: number) {
    return `This action removes a #${id} cuentasContable`;
  }
}
