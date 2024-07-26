import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { LanguageRepository } from './repositories/language.repository';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguageRepository],
})
export class LanguagesModule {}
