import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Database, InjectModel, Model, Redis } from 'cms-lib-database';
import { PaginationResquestDto, OK_200, RolesIdEnum } from 'cms-lib-resources';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { ReviewPageDataI } from '@modules/page-review/dto/page-review.dto.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { replaceRefText, saveRefText } from '@shared/helpers/page.helper.js';
import { createNotify } from '@shared/helpers/notify.helper.js';
import {
  CreateTemplateDto,
  TemplateDataMongoI,
  TemplateMongoI,
  UpdateTemplateDto,
} from '../dto/template.dto.js';
import { TemplateRepository } from '../repositories/template.repository.js';
@Injectable()
export class TemplatesService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly sitieRepository: SitieRepository,
    private readonly pageReviewRepository: PageReviewRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly notifyGateway: NotifyGateway,
    @InjectModel('ReviewTemplates')
    private readonly templateReviewModel: Model<TemplateMongoI>,
    @InjectModel('Template')
    private readonly templateModel: Model<TemplateMongoI>,
    @Inject(REQUEST) private readonly request: Request & { userId: number },
  ) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const createdTemplate = new this.templateModel(createTemplateDto);
    const templateData = await createdTemplate.save();
    createTemplateDto.mongoId = String(templateData._id);
    const newTemplate = await this.templateRepository.create(createTemplateDto);
    return this.findOne(newTemplate.id);
  }

  async findAll(paginationResquestDto: PaginationResquestDto, userId: number) {
    const templates = await this.templateRepository.get(
      paginationResquestDto,
      userId,
    );
    for (let template of templates.records) {
      const templateMongo = (await this.templateModel.findById(
        template.mongoId,
      )) as TemplateMongoI;
      template.data = templateMongo.data;
    }
    return templates;
  }

  async findOne(id: number) {
    const template = await this.templateRepository.find('id', id);
    if (template === undefined) {
      throw new HttpException(
        'No se encontro datos de la plantilla',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userId = this.request.userId;
    const draft = await Redis.get(`template-draft-${id}-${userId}`);
    if (draft) template.draft = JSON.parse(draft);
    const templateMongo = (await this.templateModel.findById(
      template.mongoId,
    )) as TemplateMongoI;

    const headerContentReview = await replaceRefText(
      templateMongo.data.header,
      'review',
    );
    const footerContentReview = await replaceRefText(
      templateMongo.data.footer,
      'review',
    );

    template.data = {
      header: headerContentReview,
      footer: footerContentReview,
    };

    const templateReview = await this.pageReviewRepository.findPageReview(
      template.id,
      'template',
      null,
    );

    if (templateReview) {
      template.reviewTemplate = {
        review: templateReview.statusReview !== 'approved',
        data: {
          ...templateReview,
          name: template.name,
        },
      };
    }

    if (template.reviewTemplate?.review) {
      const pageReviewMongo = (await this.templateReviewModel.findById(
        templateReview?.mongoId,
      )) as TemplateMongoI;
      const headerContentReview = await replaceRefText(
        pageReviewMongo.data.header,
        'review',
      );
      const footerContentReview = await replaceRefText(
        pageReviewMongo.data.footer,
        'review',
      );

      template.reviewTemplate.data!.dataReview = {
        header: headerContentReview,
        footer: footerContentReview,
      };
    }

    return template;
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.findOne(id);

    if (
      template.reviewTemplate?.review &&
      template.reviewTemplate?.data?.statusReview !== 'rejected'
    ) {
      throw new HttpException(
        'No se pudo actualizar el contenido de la plantilla, esta se encuentra en modo revisión.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      const sitie = await this.sitieRepository.find();
      if (sitie === undefined) {
        throw new HttpException(
          'No se encontro datos del sitio',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (updateTemplateDto.data) {
        const dataTemplate = updateTemplateDto.data as TemplateDataMongoI;

        const getRefTextHeader = await saveRefText(
          dataTemplate.header,
          id,
          'template',
          cnx,
        );
        const getRefTextFooter = await saveRefText(
          dataTemplate.footer,
          id,
          'template',
          cnx,
        );

        const createdTemplateReview = new this.templateReviewModel({
          data: {
            header: getRefTextHeader,
            footer: getRefTextFooter,
          },
        });
        const templateReviewData = await createdTemplateReview.save();

        if (!templateReviewData) {
          throw new HttpException(
            'No se pudo actualizar el contenido de la plantilla',
            HttpStatus.BAD_REQUEST,
          );
        }

        delete updateTemplateDto.data;
        await this.deleteDraft(id);
        const newTemplateReview = {
          templateId: id,
          userChangesId: this.request.userId,
          statusReview: 'pending',
          mongoId: String(templateReviewData._id),
          type: 'template',
        } as ReviewPageDataI;

        await this.pageReviewRepository.createReviewPage(
          newTemplateReview,
          cnx,
        );
        const rolesByNotify: number[] = [RolesIdEnum.review, RolesIdEnum.admin];
        for (let role of rolesByNotify) {
          await createNotify(
            template.id,
            template.name,
            sitie.id!,
            null,
            'template',
            `La plantilla ${template.name} tiene cambios pendientes por revisar.`,
            role,
            this.notifyGateway,
            cnx,
          );
        }
      }

      if (
        !updateTemplateDto.status &&
        template.status !== updateTemplateDto.status
      ) {
        const findActives = await this.templateRepository.findActives(
          template.id,
        );
        if (findActives.length > 0) {
          const names = findActives.map((t) => t.nameEntity);
          throw new HttpException(
            `No se puede deshabilitar la plantilla porque está siendo utilizada por: ${names.join(', ')}.`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      await this.templateRepository.update(id, updateTemplateDto, cnx);
    });

    return await this.findOne(id);
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    const findActives = await this.templateRepository.findActives(template.id);
    if (findActives.length > 0) {
      const names = findActives.map((t) => t.nameEntity);
      throw new HttpException(
        `No se puede deshabilitar la plantilla porque está siendo utilizada por: ${names.join(', ')}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    template.status = !template.status;
    delete template.data;
    const dataSource = Database.getConnection();

    await dataSource.transaction(async (cnx) => {
      await this.templateRepository.update(
        id,
        template as unknown as UpdateTemplateDto,
        cnx,
      );
    });
    return OK_200;
  }

  async saveDraft(id: number, updateTemplateDto: UpdateTemplateDto) {
    await this.findOne(id);

    const userId = this.request.userId;
    await Redis.set(
      `template-draft-${id}-${userId}`,
      JSON.stringify(updateTemplateDto.data),
    );
    return OK_200;
  }

  async deleteDraft(id: number) {
    await this.findOne(id);
    const userId = this.request.userId;
    await Redis.del(`template-draft-${id}-${userId}`);
    return this.findOne(id);
  }

  async getTemplate(language: string, templateId: number) {
    let response;

    const lang = await this.languageRepository.find('lang', language);
    if (!lang || !lang.status) {
      throw new HttpException('plantilla no encontrada', HttpStatus.NOT_FOUND);
    }

    const template = await this.templateRepository.find('id', templateId);

    if (template === undefined) {
      throw new HttpException('plantilla no encontrada', HttpStatus.NOT_FOUND);
    }

    const templateRenderRedis = await Redis.get(
      `template-${templateId}-${language}`,
    );

    if (templateRenderRedis) {
      response = JSON.parse(templateRenderRedis);
      return response;
    }

    const templateMongo = (await this.templateModel.findById(
      template.mongoId,
    )) as TemplateMongoI;
    const contentHeader = await replaceRefText(
      templateMongo.data.header,
      'current',
    );
    const contentFooter = await replaceRefText(
      templateMongo.data.footer,
      'current',
    );
    template.data = { header: contentHeader, footer: contentFooter };
    response = { ...template, languageId: lang.id, languageCode: lang.lang };
    await Redis.set(
      `template-${templateId}-${language}`,
      JSON.stringify(response),
    );
    return response;
  }
}
