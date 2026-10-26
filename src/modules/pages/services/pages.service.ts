import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import moment from 'moment-timezone';
import { InjectModel, Model, Database, Redis } from 'cms-lib-database';
import { OK_200, RolesIdEnum } from 'cms-lib-resources';
import { VisitMongoI } from '@modules/dashboard/dto/dashboard.dto.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { ReviewPageDataI } from '@modules/page-review/dto/page-review.dto.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { createNotify } from '@shared/helpers/notify.helper.js';
import {
  createPage,
  replaceRefText,
  saveRefText,
} from '@shared/helpers/page.helper.js';
import { ReferenceI } from '@shared/interfaces/reference.interface.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import {
  CreatePageDto,
  GetallDto,
  GetPageParamsDto,
  PageDataMongoI,
  PageI,
  PageMongoI,
  UpdatePageDto,
} from '../dto/page.dto.js';
import { PageRepository } from '../repositories/page.repository.js';

moment.locale('es');
moment.tz.setDefault('America/Guayaquil');

@Injectable()
export class PagesService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageReviewRepository: PageReviewRepository,
    private readonly referenceRepository: ReferenceRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly notifyGateway: NotifyGateway,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
    @InjectModel('ReviewPages')
    private readonly pageReviewModel: Model<PageMongoI>,
    @InjectModel('Visit')
    private readonly visitModel: Model<VisitMongoI>,
    @Inject(REQUEST) private readonly request: Request & { userId: number },
  ) {}

  async create(createPageDto: CreatePageDto) {
    const dataSource = Database.getConnection();
    const createdPage = await dataSource.transaction(async (cnx) => {
      const createdPage = new this.pageModel(createPageDto);
      const pageData = await createdPage.save();
      createPageDto.mongoId = String(pageData._id);
      return await createPage(createPageDto, cnx);
    });
    return this.findOne(createdPage.id);
  }

  async findAll(getallDto: GetallDto, userId: number) {
    return await this.pageRepository.get(getallDto, userId);
  }

  async findOne(id: number) {
    const page = await this.pageRepository.find('id', id);
    if (page === undefined) {
      throw new HttpException(
        'No se encontro datos de la página',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = this.request.userId;
    const draft = await Redis.get(`page-draft-${id}-${userId}`);
    if (draft) page.draft = JSON.parse(draft);
    const pageMongo = (await this.pageModel.findById(
      page.mongoId,
    )) as PageMongoI;
    const content = await replaceRefText(pageMongo.data.body, 'current');
    page.data = { body: content };

    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });

    page.details = [];

    for (let language of languages.records) {
      page.details.push({
        languageId: language.id!,
        alias: (await this.referenceRepository.find(
          page.aliasRef!,
          language.id!,
        )) as ReferenceI,
        description: (await this.referenceRepository.find(
          page.descriptionRef!,
          language.id!,
        )) as ReferenceI,
        keywords: (await this.referenceRepository.find(
          page.seoKeywordsRef!,
          language.id!,
        )) as ReferenceI,
      });
    }

    const pageReview = await this.pageReviewRepository.findPageReview(
      page.id,
      'page',
      null,
    );

    if (pageReview) {
      page.reviewPage = {
        review: pageReview.statusReview !== 'approved',
        data: {
          ...pageReview,
          name: page.name,
        },
      };
    }

    if (page.reviewPage?.review) {
      const pageReviewMongo = (await this.pageReviewModel.findById(
        pageReview?.mongoId,
      )) as PageMongoI;
      const contentReview = await replaceRefText(
        pageReviewMongo.data.body,
        'review',
      );
      page.reviewPage.data!.dataReview = { body: contentReview };
    }
    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto) {
    const page = await this.findOne(id);
    if (
      page.reviewPage?.review &&
      page.reviewPage?.data?.statusReview !== 'rejected'
    ) {
      throw new HttpException(
        'No se pudo actualizar el contenido de la página, esta se encuentra en modo revisión.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      if (updatePageDto.data) {
        const dataPage = updatePageDto.data as PageDataMongoI;
        const getRefText = await saveRefText(dataPage.body, id, 'page', cnx);

        const createdPageReview = new this.pageReviewModel({
          data: { body: getRefText },
        });
        const pageReviewData = await createdPageReview.save();

        if (!pageReviewData) {
          throw new HttpException(
            'No se pudo actualizar el contenido de la página',
            HttpStatus.BAD_REQUEST,
          );
        }

        delete updatePageDto.data;
        await this.deleteDraft(id);
        const newPageReview = {
          pageId: id,
          userChangesId: this.request.userId,
          statusReview: 'pending',
          mongoId: String(pageReviewData._id),
          type: 'page',
        } as ReviewPageDataI;

        await this.pageReviewRepository.createReviewPage(newPageReview, cnx);
        const rolesByNotify: number[] = [RolesIdEnum.review, RolesIdEnum.admin];
        for (let role of rolesByNotify) {
          await createNotify(
            page.id,
            page.name,
            page.sitieId,
            page.micrositieId,
            'page',
            `La página ${page.name} tiene cambios pendientes por revisar.`,
            role,
            this.notifyGateway,
            cnx,
          );
        }
      }

      if (updatePageDto.detail) {
        for (let detail of updatePageDto.detail) {
          for (let reference of detail.references!) {
            await this.referenceRepository.update(
              {
                languageId: detail.lang,
                ref: reference.ref,
                text: reference.value,
                type: 'page',
                pageId: id,
                templateId: null,
              },
              cnx,
            );
          }
        }
        delete updatePageDto.detail;
      }
      await this.pageRepository.update(id, updatePageDto, cnx);
    });

    return await this.findOne(id);
  }

  async remove(id: number) {
    const page = await this.findOne(id);
    const updatePage = {
      status: !page.status,
    } as UpdatePageDto;
    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      await this.pageRepository.update(id, updatePage, cnx);
    });
    return OK_200;
  }

  async saveDraft(id: number, updatePageDto: UpdatePageDto) {
    await this.findOne(id);
    const userId = this.request.userId;
    await Redis.set(
      `page-draft-${id}-${userId}`,
      JSON.stringify(updatePageDto.data),
    );
    return OK_200;
  }

  async deleteDraft(id: number) {
    await this.findOne(id);
    const userId = this.request.userId;
    await Redis.del(`page-draft-${id}-${userId}`);
    return this.findOne(id);
  }

  async getPage(
    params: GetPageParamsDto,
    sitieId: number,
    micrositieId: number | null,
  ) {
    let response;

    const lang = await this.languageRepository.find('lang', params.lang);
    if (!lang || !lang.status) {
      throw new HttpException('Página no encontrada', HttpStatus.NOT_FOUND);
    }

    let page: PageI | undefined;

    if (!params.page) {
      page = await this.pageRepository.findByRender(
        'is_home_page',
        'true',
        sitieId,
        micrositieId,
      );
    } else {
      page = await this.pageRepository.findByRender(
        'path',
        params.page,
        sitieId,
        micrositieId,
      );
    }

    if (!page || !page.status) {
      throw new HttpException('Página no encontrada', HttpStatus.NOT_FOUND);
    }

    const path = page.micrositieId
      ? `/${params.micrositie}/${page.path}`
      : `/${page.path}`;

    const pageRenderRedis = await Redis.get(`page-${page.id}-${params.lang}`);

    if (pageRenderRedis) {
      response = JSON.parse(pageRenderRedis);

      await this.saveVisitPage(page, micrositieId, params, path);
      return response;
    }

    const pageMongo = (await this.pageModel.findById(
      page.mongoId,
    )) as PageMongoI;
    const content = await replaceRefText(pageMongo.data.body, 'current');
    page.data = { body: content };

    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });

    page.details = [];

    for (let language of languages.records) {
      page.details.push({
        languageId: language.id!,
        alias: (await this.referenceRepository.find(
          page.aliasRef!,
          language.id!,
        )) as ReferenceI,
        description: (await this.referenceRepository.find(
          page.descriptionRef!,
          language.id!,
        )) as ReferenceI,
        keywords: (await this.referenceRepository.find(
          page.seoKeywordsRef!,
          language.id!,
        )) as ReferenceI,
      });
    }

    response = { ...page, languageId: lang.id, languageCode: lang.lang };

    await Redis.set(`page-${page.id}-${params.lang}`, JSON.stringify(response));

    await this.saveVisitPage(page, micrositieId, params, path);

    return response;
  }

  private async saveVisitPage(
    page: PageI,
    micrositieId: number | null,
    params: GetPageParamsDto,
    path: string,
  ) {
    if (params.preview === 'true') return;
    const createdVisitPage = new this.visitModel({
      data: {
        pageId: page.id,
        name: page.name,
        lang: params.lang,
        micrositie: params.micrositie || null,
        micrositieId: micrositieId,
        path,
        sitieId: page.sitieId,
        createdAt: moment().format('YYYY-MM-DD'),
        visitAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    });

    await createdVisitPage.save();
  }
}
