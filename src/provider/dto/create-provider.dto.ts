import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  nit: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  tipo_insumo: string;

  @IsString()
  @IsNotEmpty()
  responsable: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;
}
