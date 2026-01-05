import { Module } from '@nestjs/common';
import { ConceptosService } from './conceptos.service';
import { ConceptosController } from './conceptos.controller';

@Module({
  controllers: [ConceptosController],
  providers: [ConceptosService],
})
export class ConceptosModule {}
