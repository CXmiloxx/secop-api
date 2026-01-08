import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudPresupuestoDto } from '@/solicitud-presupuesto/dto/create-solicitud-presupuesto.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateSolicitudPresupuestoDto extends PartialType(CreateSolicitudPresupuestoDto) {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
