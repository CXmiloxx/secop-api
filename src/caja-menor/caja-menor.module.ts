import { Module } from '@nestjs/common';
import { CajaMenorService } from './caja-menor.service';
import { CajaMenorController } from './caja-menor.controller';

@Module({
  controllers: [CajaMenorController],
  providers: [CajaMenorService],
})
export class CajaMenorModule {}
