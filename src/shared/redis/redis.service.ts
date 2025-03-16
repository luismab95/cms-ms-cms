import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { config } from '../environments/load-env';

const { redisHost, redisPort, redisPassword, redisUsername } = config.server;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: redisHost,
      port: Number(redisPort),
      username: redisUsername,
      password: redisPassword,
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
