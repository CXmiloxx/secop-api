import { Module } from '@nestjs/common';
import { PresupuestoGeneralService } from './presupuesto-general.service';
import { PresupuestoGeneralController } from './presupuesto-general.controller';

@Module({
  controllers: [PresupuestoGeneralController],
  providers: [PresupuestoGeneralService],
})
export class PresupuestoGeneralModule {}
