import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RechazarSalidaProductoDto {
  @IsInt()
  @IsNotEmpty()
  idSalida: number;

  @IsString()
  @IsNotEmpty()
  rechazadorId: string;

  @IsString()
  @IsNotEmpty()
  motivoRechazo: string;
}
