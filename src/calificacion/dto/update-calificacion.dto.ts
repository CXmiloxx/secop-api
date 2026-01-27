import { PartialType } from '@nestjs/mapped-types';
import { CreateCalificacionConsultorDto } from './create-calificacion-consultor.dto';

export class UpdateCalificacionDto extends PartialType(CreateCalificacionConsultorDto) {}
