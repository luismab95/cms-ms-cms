import { Module } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';
import { ElementRepository } from './repositories/element.repository';

@Module({
  controllers: [ElementsController],
  providers: [ElementsService, ElementRepository],
})
export class ElementsModule {}
