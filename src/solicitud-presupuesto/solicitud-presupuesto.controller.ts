import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.solicitudPresupuestoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudPresupuestoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateSolicitudPresupuestoDto: UpdateSolicitudPresupuestoDto,
  ) {
    return this.solicitudPresupuestoService.update(id, updateSolicitudPresupuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudPresupuestoService.remove(+id);
  }
}
