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
import { RequisicionModule } from './requisicion/requisicion.module';
import { FilesModule } from './files/files.module';
import { PagosModule } from './pagos/pagos.module';
import { CajaMenorModule } from './caja-menor/caja-menor.module';
import { PartidaNoPresupuestadaModule } from './partida-no-presupuestada/partida-no-presupuestada.module';
import { CalificacionModule } from './calificacion/calificacion.module';
import { InventarioModule } from './inventario/inventario.module';

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
    RequisicionModule,
    FilesModule,
    PagosModule,
    CajaMenorModule,
    PartidaNoPresupuestadaModule,
    CalificacionModule,
    InventarioModule,
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
