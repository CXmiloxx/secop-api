import { PartialType } from '@nestjs/mapped-types';
import { CreatePresupuestoGeneralDto } from './create-presupuesto-general.dto';

export class UpdatePresupuestoGeneralDto extends PartialType(CreatePresupuestoGeneralDto) {}
