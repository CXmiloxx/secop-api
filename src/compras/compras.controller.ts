import { Controller, Get, Param, Query } from '@nestjs/common';
import { ComprasService } from './compras.service';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get('area/:areaId')
  async comprasPorArea(
    @Param('areaId') areaId: number,
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
    @Query('proveedor') proveedor?: string,
  ) {
    return await this.comprasService.historialComprasArea(areaId, fechaInicio, fechaFin, proveedor);
  }

  @Get('historial')
  async historialCompras(
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date,
    @Query('areaId') areaId?: number,
    @Query('proveedor') proveedor?: string,
  ) {
    return await this.comprasService.historialCompras(fechaInicio, fechaFin, areaId, proveedor);
  }
}
