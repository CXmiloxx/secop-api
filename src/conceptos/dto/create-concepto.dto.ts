import { CreateProductoDto } from '@/productos/dto/create-producto.dto';
import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateConceptoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsInt()
  @IsNotEmpty()
  cuentaContableId: number;

  @IsArray()
  @IsNotEmpty()
  productos?: CreateProductoDto[];
}
