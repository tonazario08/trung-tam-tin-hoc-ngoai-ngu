import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppCacheService } from '../cache/cache.service';

export type HealthStatus = {
  status: 'ok';
  db: 'up' | 'down';
  redis: 'up' | 'disabled';
  time: string;
};

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async check(): Promise<HealthStatus> {
    // DB: SELECT 1; loi -> 'down' (khong throw, health endpoint luon 200).
    let db: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }

    // Redis: thu set/get key 'health:ping' voi timeout ngan.
    // Redis tat -> 'disabled', khong fail health.
    let redis: 'up' | 'disabled' = 'disabled';
    try {
      const ping = Promise.resolve()
        .then(() => this.cache.set('health:ping', 'ok', 10))
        .then(() => this.cache.get<string>('health:ping'));
      const value = await Promise.race([
        ping,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (value === 'ok') redis = 'up';
    } catch {
      redis = 'disabled';
    }

    return { status: 'ok', db, redis, time: new Date().toISOString() };
  }
}
