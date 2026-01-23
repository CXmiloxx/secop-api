import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePartidaNoPresupuestadaDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsInt()
  @IsNotEmpty()
  periodo: number;

  @IsNumber()
  @IsOptional()
  ivaPresupuestado?: number;

  @IsString()
  @IsNotEmpty()
  justificacion: string;

  @IsNumber()
  @IsNotEmpty()
  valorUnitario: number;

  @IsNumber()
  @IsNotEmpty()
  valorPresupuestado: number;

  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsNumber()
  @IsOptional()
  proveedorId?: number;

  @IsString()
  @IsOptional()
  usuarioId?: string;
}
