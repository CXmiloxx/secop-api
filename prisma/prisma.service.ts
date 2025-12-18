import { PrismaClient } from '@/generated/prisma/client';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { logger } from '@/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      logger.log('✅ Prisma connected to MySQL', 'PrismaService');
    } catch (error) {
      logger.error('❌ Prisma connection error:', String(error), 'PrismaService');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    logger.log('🔌 Prisma disconnected from MySQL', 'PrismaService');
  }
}
