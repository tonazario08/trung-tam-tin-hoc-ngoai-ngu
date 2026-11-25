import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

/**
 * AppCacheService — Redis cache bang redis client thuan (khong dung
 * @nestjs/cache-manager vi cache-manager v7 doi API, de loi).
 *
 * - Lazy connect toi process.env.REDIS_URL || 'redis://localhost:6379'.
 * - Moi loi ket noi deu duoc bat, log warn, coi nhu cache tat:
 *   khong throw, khong crash app. Cac lenh get/set/del khi cache tat
 *   tra ve gia tri "rong" an toan (get -> null, set/del -> khong lam gi).
 * - Khong tu reconnect vo han: moi lan ket noi that bai se huy client
 *   do, lan goi sau se thu tao client moi (de Redis co the khoi dong
 *   lai sau backend ma cache van hoat dong tro lai).
 */
@Injectable()
export class AppCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(AppCacheService.name);
  private readonly url = process.env.REDIS_URL || 'redis://localhost:6379';
  private client: RedisClientType | null = null;
  private connecting: Promise<RedisClientType | null> | null = null;

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        try {
          this.client.destroy();
        } catch {
          /* bo qua */
        }
      }
      this.client = null;
    }
  }

  /** true khi dang co ket noi Redis mo; khong tu kich hoat ket noi. */
  isEnabled(): boolean {
    return !!this.client?.isOpen;
  }

  private async ensureClient(): Promise<RedisClientType | null> {
    if (this.client?.isOpen) return this.client;
    if (this.connecting) return this.connecting;
    this.connecting = (async () => {
      const client: RedisClientType = createClient({
        url: this.url,
        socket: {
          // Khong reconnect vo han: that bai thi dung de ensureClient
          // co the huy client va thu lai o lan goi sau.
          reconnectStrategy: () => new Error('Redis reconnect disabled'),
          connectTimeout: 2000,
        },
      });
      client.on('error', (err) =>
        this.logger.warn(`Redis error: ${err?.message || err}`),
      );
      try {
        // Timeout phong khi connect bi treo (vd. host khong phan hoi).
        await Promise.race([
          client.connect(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis connect timeout')), 2000),
          ),
        ]);
        this.client = client;
        return client;
      } catch (err: any) {
        this.logger.warn(
          `Redis khong kha dung (${this.url}): ${err?.message || err}. Cache tam tat.`,
        );
        try {
          client.destroy();
        } catch {
          /* bo qua */
        }
        this.client = null;
        return null;
      } finally {
        this.connecting = null;
      }
    })();
    return this.connecting;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.ensureClient();
    if (!client) return null;
    try {
      const raw = await client.get(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw as string) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (err: any) {
      this.logger.warn(`Redis GET ${key} loi: ${err?.message || err}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;
    try {
      const raw = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds > 0) await client.setEx(key, ttlSeconds, raw);
      else await client.set(key, raw);
    } catch (err: any) {
      this.logger.warn(`Redis SET ${key} loi: ${err?.message || err}`);
    }
  }

  async del(key: string): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;
    try {
      await client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis DEL ${key} loi: ${err?.message || err}`);
    }
  }

  /** Xoa tat ca key bat dau bang prefix (dung SCAN, khong dung KEYS). */
  async delPattern(prefix: string): Promise<void> {
    const client = await this.ensureClient();
    if (!client) return;
    try {
      for await (const key of client.scanIterator({
        MATCH: `${prefix}*`,
        COUNT: 100,
      })) {
        await client.del(key);
      }
    } catch (err: any) {
      this.logger.warn(`Redis delPattern ${prefix}* loi: ${err?.message || err}`);
    }
  }
}
