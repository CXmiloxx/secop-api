import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTrasladoActivoDto {
  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsNumber()
  @IsNotEmpty()
  cantidad: number;

  @IsInt()
  @IsNotEmpty()
  areaOrigenId: number;

  @IsInt()
  @IsNotEmpty()
  areaDestinoId: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsNotEmpty()
  solicitadoPorId: string;
}
