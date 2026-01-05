import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentasContableDto } from './create-cuentas-contable.dto';

export class UpdateCuentasContableDto extends PartialType(CreateCuentasContableDto) {}
