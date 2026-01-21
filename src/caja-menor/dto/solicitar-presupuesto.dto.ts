import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SolicitarPresupuestoDto {
  @IsNumber()
  @IsNotEmpty()
  cajaMenorId: number;

  @IsNumber()
  @IsNotEmpty()
  periodo: number;

  @IsNumber()
  @IsNotEmpty()
  montoSolicitado: number;

  @IsString()
  @IsNotEmpty()
  justificacion: string;
}
