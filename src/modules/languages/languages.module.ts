import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { LanguageRepository } from './repositories/language.repository';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguageRepository, ReferenceRepository],
})
export class LanguagesModule {}
