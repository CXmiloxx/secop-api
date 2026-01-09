import { Module } from '@nestjs/common';
import { RequisicionService } from './requisicion.service';
import { RequisicionController } from './requisicion.controller';

@Module({
  controllers: [RequisicionController],
  providers: [RequisicionService],
})
export class RequisicionModule {}
