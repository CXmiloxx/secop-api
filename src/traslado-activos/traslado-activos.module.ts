import { Module } from '@nestjs/common';
import { TrasladoActivosService } from './traslado-activos.service';
import { TrasladoActivosController } from './traslado-activos.controller';

@Module({
  controllers: [TrasladoActivosController],
  providers: [TrasladoActivosService],
})
export class TrasladoActivosModule {}
