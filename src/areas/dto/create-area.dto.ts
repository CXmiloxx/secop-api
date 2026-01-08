import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
