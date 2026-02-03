import { IsInt, IsNotEmpty } from 'class-validator';

export class ModificarStockMinimoDto {
  @IsInt()
  @IsNotEmpty()
  areaId: number;

  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsInt()
  @IsNotEmpty()
  stockMinimo: number;
}
