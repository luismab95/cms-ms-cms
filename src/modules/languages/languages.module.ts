import { Module } from '@nestjs/common';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { LanguagesController } from './controllers/languages.controller.js';
import { LanguageRepository } from './repositories/language.repository.js';
import { LanguagesService } from './services/languages.service.js';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguageRepository, ReferenceRepository],
})
export class LanguagesModule {}
