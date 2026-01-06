import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCuentasContableDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsInt()
  @IsNotEmpty()
  tipoCuentaId: number;
}
