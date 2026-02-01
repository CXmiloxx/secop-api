import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AprobarSalidaProductoDto {
  @IsInt()
  @IsNotEmpty()
  idSalida: number;

  @IsString()
  @IsNotEmpty()
  aprobadorId: string;

  @IsString()
  @IsOptional()
  justificacion?: string;
}
