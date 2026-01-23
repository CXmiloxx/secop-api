import { Module } from '@nestjs/common';
import { PartidaNoPresupuestadaService } from './partida-no-presupuestada.service';
import { PartidaNoPresupuestadaController } from './partida-no-presupuestada.controller';

@Module({
  controllers: [PartidaNoPresupuestadaController],
  providers: [PartidaNoPresupuestadaService],
})
export class PartidaNoPresupuestadaModule {}
