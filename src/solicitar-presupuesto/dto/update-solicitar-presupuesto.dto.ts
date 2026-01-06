import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitarPresupuestoDto } from './create-solicitar-presupuesto.dto';

export class UpdateSolicitarPresupuestoDto extends PartialType(CreateSolicitarPresupuestoDto) {}
