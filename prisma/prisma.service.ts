import { PrismaClient } from '@/generated/prisma/client';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
    super({ adapter, log: ['info', 'warn', 'error'] });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Prisma connected to MySQL');
    } catch (error) {
      this.logger.error('❌ Prisma connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Prisma disconnected from MySQL');
  }
}
