import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ServiceResponseI } from 'cms-lib-resources';
import { LanguageI } from '@modules/languages/dto/language.dto.js';
import { LanguagesService } from '@modules/languages/services/languages.service.js';
import { MicrositiesService } from '@modules/microsities/services/microsities.service.js';
import { GetPageParamsDto } from '@modules/pages/dto/page.dto.js';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { SitieService } from '@modules/sitie/services/sitie.service.js';
import { TemplatesService } from '@modules/templates/services/templates.service.js';

@Controller('public')
export class PublicController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly pagesService: PagesService,
    private readonly sitieService: SitieService,
    private readonly micrositiesService: MicrositiesService,
    private readonly templatesService: TemplatesService,
  ) {}

  @Get('languages')
  async getAllPublic(): Promise<LanguageI[]> {
    return await this.languagesService.getAll();
  }

  @Get('page')
  @UsePipes(new ValidationPipe())
  async getPage(
    @Query() GetallDto: GetPageParamsDto,
  ): Promise<ServiceResponseI<any | string>> {
    const sitie = await this.sitieService.findOne();
    if (!sitie || sitie.maintenance) {
      throw new HttpException(
        'Sitio en mantenimiento',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    let template = null;

    let micrositieId: number | null = null;
    if (GetallDto.micrositie) {
      const micrositie = await this.micrositiesService.findOne(
        GetallDto.micrositie,
        'path',
      );
      if (!micrositie || !micrositie.status) {
        throw new HttpException(
          'Sitio en mantenimiento',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      micrositieId = micrositie.id!;
      template = await this.templatesService.getTemplate(
        GetallDto.lang,
        micrositie.templateId,
      );
    } else {
      template = await this.templatesService.getTemplate(
        GetallDto.lang,
        sitie.templateId,
      );
    }

    const page = await this.pagesService.getPage(
      GetallDto,
      sitie.id!,
      micrositieId,
    );

    return {
      message: { ...page, template },
      statusCode: HttpStatus.OK,
    };
  }
}
