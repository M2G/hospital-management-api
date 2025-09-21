import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClient, REDIS_CLIENT } from 'src/config/redis-client.type';
import { ICacheRepository } from '@domain/interfaces';

@Injectable()
class RedisRepository implements OnModuleDestroy, ICacheRepository {
  public constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  /**
   * Close redis connection on shutdown
   */
  onModuleDestroy() {
    void this.redis.quit();
  }

  scanIterator(keyMatch: string): AsyncIterable<string[], void, unknown> {
    return this.redis.scanIterator({
      COUNT: 100,
      MATCH: keyMatch,
    });
  }

  get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }

  delete(key: string): any {
    return this.redis.del(key);
  }

  async setWithExpiry(key: string, value: string, expiry: number): Promise<void> {
    await this.redis.set(key, value, { EX: expiry });
  }
}

export default RedisRepository;
