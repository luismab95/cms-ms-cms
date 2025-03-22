import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyRepository } from './repositories/notify.repository';
import { NotifyService } from './notify.service';

@Module({
  controllers: [NotifyController],
  providers: [NotifyService, NotifyRepository],
})
export class NotifyModule {}
