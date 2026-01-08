import { Module } from '@nestjs/common';
import { PresupuestoService } from './presupuesto.service';
import { PresupuestoController } from './presupuesto.controller';

@Module({
  controllers: [PresupuestoController],
  providers: [PresupuestoService],
})
export class PresupuestoModule {}
