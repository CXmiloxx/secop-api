import { PartialType } from '@nestjs/mapped-types';
import { CreateCajaMenorDto } from './create-caja-menor.dto';

export class UpdateCajaMenorDto extends PartialType(CreateCajaMenorDto) {}
