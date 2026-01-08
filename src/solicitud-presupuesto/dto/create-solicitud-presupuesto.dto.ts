import { ArticuloSolicitudPresupuesto } from '@/generated/prisma/client';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSolicitudPresupuestoDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsInt()
  @IsNotEmpty()
  periodo: number;

  @IsOptional()
  @IsString()
  justificacion?: string;

  @IsString()
  @IsNotEmpty()
  usuarioSolicitanteId: string;

  @IsNumber()
  @IsNotEmpty()
  montoSolicitado: number;

  @IsOptional()
  @IsInt()
  porcentajeAprobacion?: number;

  @IsOptional()
  @IsNumber()
  montoAprobado?: number;

  @IsString()
  @IsOptional()
  aprobadoPorId?: string;

  @IsDateString()
  @IsNotEmpty()
  @IsOptional()
  fechaAprobacion?: string;

  @IsArray()
  @IsNotEmpty()
  articulos: ArticuloSolicitudPresupuesto[];
}
