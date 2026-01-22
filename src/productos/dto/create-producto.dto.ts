import { TipoProducto } from '@/generated/prisma/enums';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: TipoProducto;

  @IsInt()
  @IsNotEmpty()
  conceptoContableId: number;
}
