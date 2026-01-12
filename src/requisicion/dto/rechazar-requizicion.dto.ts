import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RechazarRequisicionDto {
  @IsString()
  @IsNotEmpty()
  motivoRechazo: string;

  @IsString()
  @IsNotEmpty()
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
}
