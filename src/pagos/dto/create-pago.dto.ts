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
  metodoPago: string;

  @IsOptional()
  @IsString()
  soporteFactura: string;
}
