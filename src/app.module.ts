import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesModule } from './modules/files/files.module';
import { SitieModule } from './modules/sitie/sitie.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './shared/environments/load-env';
import { MicrositiesModule } from './modules/microsities/microsities.module';
const { mongoUri } = config.server;
@Module({
  imports: [
    FilesModule,
    SitieModule,
    LanguagesModule,
    TemplatesModule,
    MongooseModule.forRoot(`${mongoUri}`),
    MicrositiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
