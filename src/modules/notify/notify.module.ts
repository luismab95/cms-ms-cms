import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyRepository } from './repositories/notify.repository';
import { NotifyService } from './notify.service';
import { NotifyGateway } from './notify.gateway';

@Module({
  controllers: [NotifyController],
  providers: [NotifyService, NotifyRepository, NotifyGateway],
})
export class NotifyModule {}
