import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCajaMenorDto {
  @IsNumber()
  @IsNotEmpty()
  periodo: number;

  @IsNumber()
  @IsNotEmpty()
  topeMaximo: number;

  @IsNumber()
  @IsNotEmpty()
  presupuestoAsignado: number;
}
