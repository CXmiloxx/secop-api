import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AprobarSalidaProductoDto {
  @IsInt()
  @IsNotEmpty()
  idSalida: number;

  @IsString()
  @IsNotEmpty()
  aprobadorId: string;
}
