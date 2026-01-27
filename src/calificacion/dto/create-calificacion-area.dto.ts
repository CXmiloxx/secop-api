import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCalificacionAreaDto {
  @IsInt()
  areaId: number;

  @IsInt()
  requisicionId: number;

  @IsString()
  @IsOptional()
  comentario: string;

  @IsString()
  consultorId: string;

  @IsInt()
  calidadProducto: number;

  @IsInt()
  tiempoEntrega: number;
}
