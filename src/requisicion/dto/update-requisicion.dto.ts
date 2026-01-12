import { PartialType } from '@nestjs/mapped-types';
import { CreateRequisicionDto } from './create-requisicion.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRequisicionDto extends PartialType(CreateRequisicionDto) {
  @IsNumber()
  @IsOptional()
  ivaDefinido?: number;

  @IsNumber()
  @IsOptional()
  valorDefinido?: number;

  @IsString()
  numeroComite: string;

  @IsBoolean()
  @IsOptional()
  rector?: boolean;

  @IsBoolean()
  @IsOptional()
  vicerrector?: boolean;

  @IsBoolean()
  @IsOptional()
  sindico?: boolean;

  @IsBoolean()
  @IsOptional()
  daGarantia?: boolean;

  @IsString()
  @IsOptional()
  tiempoGarantia?: string;

  @IsString()
  @IsOptional()
  unidadGarantia?: string;
}
