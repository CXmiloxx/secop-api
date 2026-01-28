import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get('requisiciones-pendientes')
  async requisicionesPendientesInventario(@Query('periodo') periodo: number) {
    return await this.inventarioService.requisicionesPendientesInventario(periodo);
  }

  @Get('historial-movimientos')
  async historialMovimientos() {
    return await this.inventarioService.historialMovimientos();
  }

  @Get('general')
  async inventarioGeneral() {
    return await this.inventarioService.inventarioGeneral();
  }

  @Get('area/:areaId')
  async inventarioArea(@Param('areaId') areaId: number) {
    return await this.inventarioService.inventarioArea(areaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioDto: UpdateInventarioDto) {
    return this.inventarioService.update(+id, updateInventarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioService.remove(+id);
  }
}
