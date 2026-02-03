import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { SalidaProductoService } from './salida-producto.service';
import { CreateSalidaProductoDto } from './dto/create-salida-producto.dto';
import { AprobarSalidaProductoDto } from './dto/aprobar-salida-producto.dto';
import { RechazarSalidaProductoDto } from './dto/rechazar-salida-producto.dto';

@Controller('salida-producto')
export class SalidaProductoController {
  constructor(private readonly salidaProductoService: SalidaProductoService) {}

  @Get('productos-disponibles-area/:areaId')
  obtenerProductosDisponibles(@Param('areaId') areaId: number) {
    return this.salidaProductoService.obtenerProductosDisponibles(areaId);
  }

  @Post('solicitud')
  createSolicitudSalidaProducto(@Body() createSalidaProductoDto: CreateSalidaProductoDto) {
    return this.salidaProductoService.createSolicitudSalidaProducto(createSalidaProductoDto);
  }

  @Get('solicitudes-pendientes')
  solicitudesPendientes() {
    return this.salidaProductoService.solicitudesPendientes();
  }

  @Get('historial-solicitudes/:areaId')
  historialSolicitudes(@Param('areaId') areaId: number) {
    return this.salidaProductoService.historialSolicitudes(areaId);
  }

  @Patch('aprobar')
  aprobarSolicitudSalidaProducto(@Body() aprobarSalidaProductoDto: AprobarSalidaProductoDto) {
    return this.salidaProductoService.aprobarSolicitudSalidaProducto(aprobarSalidaProductoDto);
  }

  @Patch('rechazar')
  rechazarSolicitudSalidaProducto(@Body() rechazarSalidaProductoDto: RechazarSalidaProductoDto) {
    return this.salidaProductoService.rechazarSolicitudSalidaProducto(rechazarSalidaProductoDto);
  }
}
