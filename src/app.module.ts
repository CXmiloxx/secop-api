import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@/auth/auth.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PrismaModule } from '@prisma/prisma.module';
import { ProviderModule } from '@/provider/provider.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CuentasContablesModule } from '@/cuentas-contables/cuentas-contables.module';
import { ConceptosModule } from '@/conceptos/conceptos.module';
import { ProductosModule } from '@/productos/productos.module';
import { SolicitudPresupuestoModule } from '@/solicitud-presupuesto/solicitud-presupuesto.module';
import { PresupuestoModule } from './presupuesto/presupuesto.module';
import { PresupuestoGeneralModule } from './presupuesto-general/presupuesto-general.module';
import { AreasModule } from './areas/areas.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProviderModule,
    CuentasContablesModule,
    ConceptosModule,
    ProductosModule,
    SolicitudPresupuestoModule,
    PresupuestoModule,
    PresupuestoGeneralModule,
    AreasModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
