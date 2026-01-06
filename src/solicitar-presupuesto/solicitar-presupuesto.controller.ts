import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitarPresupuestoService } from './solicitar-presupuesto.service';
import { CreateSolicitarPresupuestoDto } from './dto/create-solicitar-presupuesto.dto';
import { UpdateSolicitarPresupuestoDto } from './dto/update-solicitar-presupuesto.dto';

@Controller('solicitar-presupuesto')
export class SolicitarPresupuestoController {
  constructor(private readonly solicitarPresupuestoService: SolicitarPresupuestoService) {}

  @Post()
  create(@Body() createSolicitarPresupuestoDto: CreateSolicitarPresupuestoDto) {
    return this.solicitarPresupuestoService.create(createSolicitarPresupuestoDto);
  }

  @Get()
  findAll() {
    return this.solicitarPresupuestoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitarPresupuestoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitarPresupuestoDto: UpdateSolicitarPresupuestoDto) {
    return this.solicitarPresupuestoService.update(+id, updateSolicitarPresupuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitarPresupuestoService.remove(+id);
  }
}
