import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateArticuloPresupuestoDto } from './create-articulo-presupuesto.dto';

export class CreatePresupuestoDto {
  @IsInt()
  id_area: number;

  @IsDateString()
  anio: string;

  @IsString()
  justificacion: string;

  @IsNumber()
  valor_solicitado: number;

  @IsNumber()
  @IsOptional()
  porcentaje_aprobacion: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticuloPresupuestoDto)
  articulos_presupuestos: CreateArticuloPresupuestoDto[];
}
