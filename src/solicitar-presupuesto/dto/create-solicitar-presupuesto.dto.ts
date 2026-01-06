import { ArticuloSolicitudPresupuesto } from '@/generated/prisma/client';
import { EstadoPresupuesto } from '@/generated/prisma/enums';
import {
  IsArray,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSolicitarPresupuestoDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsInt()
  @IsNotEmpty()
  periodoId: number;

  @IsOptional()
  @IsString()
  justificacion?: string;

  @IsString()
  @IsNotEmpty()
  usuarioSolicitanteId: string;

  @IsEnum(EstadoPresupuesto)
  @IsNotEmpty()
  estado: EstadoPresupuesto;

  @IsDecimal()
  @IsNotEmpty()
  montoSolicitado: string;

  @IsInt()
  @IsNotEmpty()
  porcentajeAprobacion: number;

  @IsNumber()
  @IsNotEmpty()
  montoAprobado: number;

  @IsString()
  aprobadoPorId: string;

  @IsDateString()
  @IsNotEmpty()
  fechaAprobacion: string;

  @IsArray()
  @IsNotEmpty()
  articulos: ArticuloSolicitudPresupuesto[];
}
