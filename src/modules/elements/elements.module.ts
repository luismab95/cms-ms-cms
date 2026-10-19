import { Module } from '@nestjs/common';
import { ElementsController } from './controllers/elements.controller.js';
import { ElementRepository } from './repositories/element.repository.js';
import { ElementsService } from './services/elements.service.js';

@Module({
  controllers: [ElementsController],
  providers: [ElementsService, ElementRepository],
})
export class ElementsModule {}
