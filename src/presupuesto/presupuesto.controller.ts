import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PresupuestoService } from './presupuesto.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';

@Controller('presupuesto')
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Post()
  async create(@Body() createPresupuestoDto: CreatePresupuestoDto) {
    return await this.presupuestoService.create(createPresupuestoDto);
  }

  @Get()
  async findAll(@Query('periodo') periodo: number) {
    return await this.presupuestoService.findAll(periodo);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.presupuestoService.findOne(+id);
  }

  @Get('area/:id/detalles')
  async findDetallesByArea(@Param('id') id: number, @Query('periodo') periodo: number) {
    return await this.presupuestoService.findDetallesByArea(id, periodo);
  }

  @Get('area/:areaId')
  async findByAreaId(@Param('areaId') areaId: number, @Query('periodo') periodo: number) {
    return await this.presupuestoService.findByAreaId(areaId, periodo);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePresupuestoDto: UpdatePresupuestoDto) {
    return await this.presupuestoService.update(+id, updatePresupuestoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.presupuestoService.remove(+id);
  }
}
