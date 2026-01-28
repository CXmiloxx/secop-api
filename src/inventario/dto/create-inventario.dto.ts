import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInventarioDto {
  @IsInt()
  @IsNotEmpty()
  requisicionId: number;

  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  consultorId: string;

  @IsDateString()
  @IsNotEmpty()
  fechaIngreso: string;

  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsString()
  @IsNotEmpty()
  ubicacion: string;
}
