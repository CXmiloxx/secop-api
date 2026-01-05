import { PartialType } from '@nestjs/mapped-types';
import { CreateConceptoDto } from './create-concepto.dto';

export class UpdateConceptoDto extends PartialType(CreateConceptoDto) {}
