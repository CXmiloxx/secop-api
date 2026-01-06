import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudPresupuestoDto } from './create-solicitud-presupuesto.dto';

export class UpdateSolicitudPresupuestoDto extends PartialType(CreateSolicitudPresupuestoDto) {}
