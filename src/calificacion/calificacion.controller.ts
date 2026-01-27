import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CalificacionService } from './calificacion.service';
import { CreateCalificacionConsultorDto } from './dto/create-calificacion-consultor.dto';
import { CreateCalificacionAreaDto } from './dto/create-calificacion-area.dto';

@Controller('calificacion')
export class CalificacionController {
  constructor(private readonly calificacionService: CalificacionService) {}

  @Post('consultor')
  async createCalificacionConsultor(@Body() dto: CreateCalificacionConsultorDto) {
    return await this.calificacionService.createCalificacionConsultor(dto);
  }

  @Post('area')
  async createCalificacionArea(@Body() dto: CreateCalificacionAreaDto) {
    return await this.calificacionService.createCalificacionArea(dto);
  }

  @Get('pendientes')
  async pendientesCalificar(@Query('periodo') periodo: number) {
    return await this.calificacionService.pendientesCalificar(periodo);
  }

  @Get('pendientes/area')
  async pendientesCalificarArea(
    @Query('periodo') periodo: number,
    @Query('areaId') areaId: number,
  ) {
    return await this.calificacionService.pendientesCalificarArea(periodo, areaId);
  }

  @Get('consultor/historial')
  async historialCalificacionConsultor(
    @Query('periodo') periodo: number,
    @Query('tipo') tipo: 'proveedor' | 'tesoreria',
  ) {
    return await this.calificacionService.historialCalificaciones(periodo, tipo);
  }

  @Get('area/historial')
  async historialCalificacionArea(
    @Query('periodo') periodo: number,
    @Query('areaId') areaId: number,
  ) {
    return await this.calificacionService.historialCalificacionesArea(periodo, areaId);
  }
}
