import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCalificacionConsultorDto {
  @IsInt()
  calidadProducto: number;

  @IsInt()
  tiempoEntrega: number;

  @IsInt()
  tiempoGarantia: number;

  @IsInt()
  puntualidad: number;

  @IsInt()
  precio: number;

  @IsString()
  @IsOptional()
  comentario: string;

  @IsString()
  @IsNotEmpty()
  consultorId: string;

  @IsInt()
  requisicionId: number;

  @IsInt()
  proveedorId: number;

  @IsInt()
  pagoIdTesoreria: number;

  @IsInt()
  @IsNotEmpty()
  pagoOportunoTesoreria: number;

  @IsString()
  @IsOptional()
  comentarioTesoreria: string;
}
