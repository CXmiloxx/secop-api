import { TipoPago } from '@/generated/prisma/enums';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePagoDto {
  @IsString()
  @IsNotEmpty()
  requisicionId: string;

  @IsString()
  @IsNotEmpty()
  usuarioRegistradorId: string;

  @IsString()
  @IsNotEmpty()
  total: string;

  @IsString()
  @IsNotEmpty()
  tipoPago: TipoPago;

  @IsOptional()
  @IsString()
  soporteFactura: string;
}
