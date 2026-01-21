import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearMovimientoDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  cajaMenorId: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  valorTotal: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  iva?: number;

  @Type(() => Number)
  @IsOptional()
  areaId?: number;

  @Type(() => Number)
  @IsOptional()
  proveedorId?: number;

  @Type(() => Number)
  @IsOptional()
  cuentaContableId?: number;

  @Type(() => Number)
  @IsOptional()
  conceptoContableId?: number;

  @IsString()
  @IsNotEmpty()
  justificacion: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  valorBase: number;

  @IsString()
  @IsNotEmpty()
  descripcionProducto: string;
}
