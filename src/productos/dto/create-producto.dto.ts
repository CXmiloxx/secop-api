import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsInt()
  @IsNotEmpty()
  conceptoContableId: number;
}
