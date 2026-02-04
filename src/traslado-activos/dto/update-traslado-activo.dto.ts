import { PartialType } from '@nestjs/mapped-types';
import { CreateTrasladoActivoDto } from './create-traslado-activo.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTrasladoActivoDto extends PartialType(CreateTrasladoActivoDto) {
  @IsInt()
  @IsNotEmpty()
  idTraslado: number;

  @IsString()
  @IsOptional()
  aprobadorId: string;

  @IsString()
  @IsOptional()
  motivoRechazo?: string;

  @IsString()
  @IsOptional()
  rechazadorId?: string;
}
