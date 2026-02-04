import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ModificarDetalleProductoDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsInt()
  @IsNotEmpty()
  stockMinimo: number;

  @IsString()
  @IsOptional()
  ubicacion?: string;
}
