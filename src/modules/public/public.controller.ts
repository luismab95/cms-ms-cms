import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LanguageI } from '../languages/dto/language.dto';
import { LanguagesService } from '../languages/languages.service';
import { PagesService } from '../pages/pages.service';
import { GetPageParamsDto, PageI } from '../pages/dto/page.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { SitieService } from '../sitie/sitie.service';
import { MicrositiesService } from '../microsities/microsities.service';
import { MicrositieI } from '../microsities/dto/microsity.dto';
import { TemplatesService } from '../templates/templates.service';

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
  ): Promise<ServiceResponseInterface<any | string>> {
    const sitie = await this.sitieService.findOne();
    if (!sitie || sitie.maintenance) {
      throw new HttpException(
        'Sitio en mantenimiento',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

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
      micrositieId = micrositie.id;
    }

    const template = await this.templatesService.findOne(sitie.templateId);

    const page = await this.pagesService.getPage(
      GetallDto,
      sitie.id,
      micrositieId,
    );

    return {
      message: { ...page, template },
      statusCode: HttpStatus.OK,
    };
  }
}
