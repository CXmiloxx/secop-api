import { Module } from '@nestjs/common';
import { SolicitarPresupuestoService } from './solicitar-presupuesto.service';
import { SolicitarPresupuestoController } from './solicitar-presupuesto.controller';

@Module({
  controllers: [SolicitarPresupuestoController],
  providers: [SolicitarPresupuestoService],
})
export class SolicitarPresupuestoModule {}
