import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('proveedores')
  async calificacionesProveedores(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reporteProveedores(fechaInicio, fechaFin);
  }

  @Get('consultor')
  async reporteConsultor(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reporteConsultor(fechaInicio, fechaFin);
  }

  @Get('tesoreria')
  async reporteTesoreria(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reporteTesoreria(fechaInicio, fechaFin);
  }

  @Get('presupuesto-general')
  async reportePresupuestoGeneral(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reportePresupuestoGeneral(fechaInicio, fechaFin);
  }

  @Get('presupuestos')
  async reportePresupuestos(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reportePresupuestos(fechaInicio, fechaFin);
  }

  @Get('partidas-no-presupuestadas')
  async reportePartidaNoPresupuestada(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
  ) {
    return await this.reportesService.reportePartidaNoPresupuestada(fechaInicio, fechaFin);
  }
}
