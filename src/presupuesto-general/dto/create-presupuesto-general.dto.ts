import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePresupuestoGeneralDto {
  @IsNumber()
  @IsNotEmpty()
  montoComprometido: number;

  @IsNumber()
  @IsNotEmpty()
  periodo: number;

  @IsNumber()
  @IsNotEmpty()
  presupuestoTotal: number;

  @IsNumber()
  @IsNotEmpty()
  totalEjecutado: number;
}
