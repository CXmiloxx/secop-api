import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { TrasladoActivosService } from './traslado-activos.service';
import { CreateTrasladoActivoDto } from './dto/create-traslado-activo.dto';
import { UpdateTrasladoActivoDto } from './dto/update-traslado-activo.dto';

@Controller('traslado-activos')
export class TrasladoActivosController {
  constructor(private readonly trasladoActivosService: TrasladoActivosService) {}

  @Post()
  create(@Body() createTrasladoActivoDto: CreateTrasladoActivoDto) {
    return this.trasladoActivosService.create(createTrasladoActivoDto);
  }

  @Get('solicitudes-pendientes')
  solicitudesPendientes() {
    return this.trasladoActivosService.solicitudesPendientes();
  }

  @Get('activo-seleccionado/:id')
  findOne(@Param('id') id: number, @Query('areaId') areaId: number) {
    return this.trasladoActivosService.findOne(id, areaId);
  }

  @Patch('/aprobar')
  approve(@Body() updateTrasladoActivoDto: UpdateTrasladoActivoDto) {
    return this.trasladoActivosService.aprobarTraslado(updateTrasladoActivoDto);
  }

  @Patch('/rechazar')
  reject(@Body() updateTrasladoActivoDto: UpdateTrasladoActivoDto) {
    return this.trasladoActivosService.rechazarTraslado(updateTrasladoActivoDto);
  }
}
