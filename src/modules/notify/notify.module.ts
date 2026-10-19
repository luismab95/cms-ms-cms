import { Module } from '@nestjs/common';
import { NotifyController } from './controllers/notify.controller.js';
import { NotifyRepository } from './repositories/notify.repository.js';
import { NotifyGateway } from './services/notify.gateway.js';
import { NotifyService } from './services/notify.service.js';

@Module({
  controllers: [NotifyController],
  providers: [NotifyService, NotifyRepository, NotifyGateway],
})
export class NotifyModule {}
