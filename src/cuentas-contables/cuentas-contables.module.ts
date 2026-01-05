import { Module } from '@nestjs/common';
import { CuentasContablesService } from './cuentas-contables.service';
import { CuentasContablesController } from './cuentas-contables.controller';

@Module({
  controllers: [CuentasContablesController],
  providers: [CuentasContablesService],
})
export class CuentasContablesModule {}
