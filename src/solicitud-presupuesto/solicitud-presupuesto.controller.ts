import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SolicitudPresupuestoService } from '@/solicitud-presupuesto/solicitud-presupuesto.service';
import { CreateSolicitudPresupuestoDto } from '@/solicitud-presupuesto/dto/create-solicitud-presupuesto.dto';
import { UpdateSolicitudPresupuestoDto } from '@/solicitud-presupuesto/dto/update-solicitud-presupuesto.dto';

@Controller('solicitud-presupuesto')
export class SolicitudPresupuestoController {
  constructor(private readonly solicitudPresupuestoService: SolicitudPresupuestoService) {}

  @Post()
  create(@Body() createSolicitudPresupuestoDto: CreateSolicitudPresupuestoDto) {
    return this.solicitudPresupuestoService.create(createSolicitudPresupuestoDto);
  }

  @Get()
  findAll(@Query('periodo') periodo: number) {
    return this.solicitudPresupuestoService.findAll(periodo);
  }

  @Get('area/:areaId')
  findSolicitudByArea(@Param('areaId') areaId: number, @Query('periodo') periodo: number) {
    return this.solicitudPresupuestoService.findSolicitudByArea(areaId, periodo);
  }

  @Patch('aprobar')
  aprobarSolicitud(@Body() aprobarSolicitudDto: UpdateSolicitudPresupuestoDto) {
    return this.solicitudPresupuestoService.aprobarSolicitud(aprobarSolicitudDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudPresupuestoService.findOne(+id);
  }

  @Patch(':id')
  editSolicitud(
    @Param('id') id: number,
    @Body() updateSolicitudPresupuestoDto: UpdateSolicitudPresupuestoDto,
  ) {
    return this.solicitudPresupuestoService.editSolicitud(id, updateSolicitudPresupuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudPresupuestoService.remove(+id);
  }
}
