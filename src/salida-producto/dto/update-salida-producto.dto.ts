import { PartialType } from '@nestjs/mapped-types';
import { CreateSalidaProductoDto } from './create-salida-producto.dto';

export class UpdateSalidaProductoDto extends PartialType(CreateSalidaProductoDto) {}
