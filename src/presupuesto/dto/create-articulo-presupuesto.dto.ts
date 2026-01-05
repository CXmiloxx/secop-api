import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateArticuloPresupuestoDto {
  @IsInt()
  id_cuenta_contable: number;

  @IsInt()
  id_concepto_contable: number;

  @IsInt()
  id_producto_contable: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;

  @IsNumber()
  @IsPositive()
  valor_unitario: number;
}
