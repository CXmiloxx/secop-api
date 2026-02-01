import { Module } from '@nestjs/common';
import { SalidaProductoService } from './salida-producto.service';
import { SalidaProductoController } from './salida-producto.controller';

@Module({
  controllers: [SalidaProductoController],
  providers: [SalidaProductoService],
})
export class SalidaProductoModule {}
