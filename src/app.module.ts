import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PrismaModule } from '@prisma/prisma.module';
import { ProviderModule } from '@/provider/provider.module';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule, ProviderModule],
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
