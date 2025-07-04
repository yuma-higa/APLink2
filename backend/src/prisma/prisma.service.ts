import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected successfully');
    } catch (err) {
      console.error('❌ Prisma connection failed:', err.message);
      // throw err; ← エラーを握り潰すことで NestJS を落とさない
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
