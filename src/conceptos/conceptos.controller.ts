import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConceptosService } from './conceptos.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Controller('conceptos')
export class ConceptosController {
  constructor(private readonly conceptosService: ConceptosService) {}

  @Post()
  create(@Body() createConceptoDto: CreateConceptoDto) {
    return this.conceptosService.create(createConceptoDto);
  }

  @Get(':idCuentaContable')
  findAll(idCuentaContable: number) {
    return this.conceptosService.findAll(idCuentaContable);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConceptoDto: UpdateConceptoDto) {
    return this.conceptosService.update(+id, updateConceptoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptosService.remove(+id);
  }
}
