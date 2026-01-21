import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AprobarPresupuestoDto {
  @IsInt()
  @IsNotEmpty()
  solicitudId: number;

  @IsNumber()
  @IsNotEmpty()
  montoAprobado: number;

  @IsString()
  @IsNotEmpty()
  justificacion: string;
}
