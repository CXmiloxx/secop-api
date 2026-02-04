import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { EstadoActivo } from '@/generated/prisma/enums';
import { ModificarDetalleProductoDto } from './dto/modificar-producto.dto';

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
  async inventarioGeneral(
    @Query('areaId') areaId?: number,
    @Query('nombreProducto') nombreProducto?: string,
    @Query('conceptoId') conceptoId?: number,
    @Query('estadoActivo') estadoActivo?: EstadoActivo,
  ) {
    return await this.inventarioService.inventarioGeneral(
      areaId,
      nombreProducto,
      conceptoId,
      estadoActivo,
    );
  }

  @Get('area/:areaId')
  async inventarioArea(
    @Param('areaId') areaId: number,
    @Query('nombreProducto') nombreProducto?: string,
    @Query('conceptoId') conceptoId?: number,
    @Query('estadoActivo') estadoActivo?: EstadoActivo,
  ) {
    return await this.inventarioService.inventarioArea(
      areaId,
      nombreProducto,
      conceptoId,
      estadoActivo,
    );
  }

  @Patch('producto')
  async modificarDetalleProducto(@Body() modificarDetalleProductoDto: ModificarDetalleProductoDto) {
    return await this.inventarioService.modificarDetalleProducto(modificarDetalleProductoDto);
  }
}
