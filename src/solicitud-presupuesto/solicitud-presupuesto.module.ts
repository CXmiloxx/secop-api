import { Module } from '@nestjs/common';
import { SolicitudPresupuestoService } from './solicitud-presupuesto.service';
import { SolicitudPresupuestoController } from './solicitud-presupuesto.controller';

@Module({
  controllers: [SolicitudPresupuestoController],
  providers: [SolicitudPresupuestoService],
})
export class SolicitudPresupuestoModule {}
