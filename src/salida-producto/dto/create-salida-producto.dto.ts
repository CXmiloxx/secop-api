import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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
  @IsNotEmpty()
  solicitadoPorId: string;
}
