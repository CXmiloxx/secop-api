import { IsString, IsEmail, IsEnum, IsInt, MinLength, IsNotEmpty } from 'class-validator';
import { tipoDocumento } from '../../generated/prisma/client';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasena: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsEnum(tipoDocumento)
  tipo_documento: tipoDocumento;

  @IsString()
  @IsNotEmpty()
  documento: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsInt()
  rolId: number;

  @IsInt()
  areaId: number;
}
