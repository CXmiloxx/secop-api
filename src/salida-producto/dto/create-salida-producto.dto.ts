import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSalidaProductoDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsString()
  @IsOptional()
  justificacion?: string;

  @IsString()
  @IsNotEmpty()
  solicitadoPorId: string;
}
