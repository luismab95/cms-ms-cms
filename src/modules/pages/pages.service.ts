import {
  CreatePageDto,
  ElementDataI,
  GetallDto,
  GetPageParamsDto,
  PageDataMongoI,
  PageI,
  PageMongoI,
  PageReviewI,
  ReviewPageDto,
  UpdatePageDto,
} from './dto/page.dto';
import { ColumnI } from '../../shared/interfaces/page.interface';
import { createPage } from 'src/shared/helpers/page.helper';
import { Database } from 'lib-database/src/shared/config/database';
import { EntityManager } from 'typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LanguageRepository } from '../languages/repositories/language.repository';
import { Model } from 'mongoose';
import { OK_200 } from 'src/shared/constants/message.constants';
import { PageRepository } from './repositories/page.repository';
import { randomCharacters } from 'src/shared/helpers/random.helper';
import { RedisService } from 'src/shared/redis/redis.service';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';
import { REQUEST } from '@nestjs/core';
import { VisitMongoI } from '../dashboard/dto/dashboard.dto';
import * as moment from 'moment-timezone';

moment.locale('es');
moment.tz.setDefault('America/Guayaquil');

@Injectable()
export class PagesService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly referenceRepository: ReferenceRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly redisService: RedisService,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
    @InjectModel('Review')
    private readonly pageReviewModel: Model<PageMongoI>,
    @InjectModel('Visit')
    private readonly visitModel: Model<VisitMongoI>,
    @Inject(REQUEST) private readonly request: Request,
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

  async findAll(getallDto: GetallDto) {
    return await this.pageRepository.get(getallDto);
  }

  async findAllReview(getallDto: GetallDto) {
    return await this.pageRepository.getForReview(getallDto);
  }

  async findOne(id: number) {
    const page = await this.pageRepository.find('id', id);
    if (page === undefined) {
      throw new HttpException(
        'No se encontro datos de la página',
        HttpStatus.BAD_REQUEST,
      );
    }
    const draft = await this.redisService.get(`page-draft-${id}`);
    page.draft = JSON.parse(draft);
    const pageMongo = (await this.pageModel.findById(
      page.mongoId,
    )) as PageMongoI;
    page.data = await this.replaceRefText(pageMongo.data);

    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });

    page.details = [];

    for (let language of languages.records) {
      page.details.push({
        languageId: language.id,
        alias: await this.referenceRepository.find(page.aliasRef, language.id),
        description: await this.referenceRepository.find(
          page.descriptionRef,
          language.id,
        ),
        keywords: await this.referenceRepository.find(
          page.seoKeywordsRef,
          language.id,
        ),
      });
    }

    const validReviewMode = await this.pageRepository.findPageReview(
      page.id,
      'pending',
    );
    page.review = !!validReviewMode ? true : false;

    return page;
  }

  async findOneReview(id: number) {
    const page = await this.pageRepository.findForReview(id);
    if (page === undefined) {
      throw new HttpException(
        'No se encontro datos de la página',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pageMongo = (await this.pageModel.findById(
      page.mongoId,
    )) as PageMongoI;
    page.data = await this.replaceRefText(pageMongo.data);

    const pageReviewMongo = (await this.pageReviewModel.findById(
      page.reviewMongoId,
    )) as PageMongoI;
    page.dataReview = await this.replaceRefText(pageReviewMongo.data);

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto) {
    try {
      await this.findOne(id);

      const dataSource = Database.getConnection();
      await dataSource.transaction(async (cnx) => {
        if (updatePageDto.data) {
          const getRefText = await this.saveRefText(updatePageDto);

          const createdPageReview = new this.pageReviewModel(getRefText);
          const pageReviewData = await createdPageReview.save();

          if (!pageReviewData) {
            throw new HttpException(
              'No se pudo actualizar la informaciòn de la página',
              HttpStatus.BAD_REQUEST,
            );
          }

          delete updatePageDto.data;
          await this.deleteDraft(id);
          const newpageReview = {
            pageId: id,
            userId: this.request['userId'],
            status: 'pending',
            mongoId: String(pageReviewData._id),
          } as PageReviewI;
          await this.pageRepository.createReviewPage(newpageReview, cnx);
        }

        if (updatePageDto.detail) {
          for (let detail of updatePageDto.detail) {
            for (let reference of detail.references) {
              await this.referenceRepository.update(
                {
                  languageId: detail.lang,
                  ref: reference.ref,
                  text: reference.value,
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
    } catch (error) {
      throw new HttpException(
        'No se pudo actualizar la informaciòn de la página',
        HttpStatus.BAD_REQUEST,
      );
    }
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
    await this.redisService.set(
      `page-draft-${id}`,
      JSON.stringify(updatePageDto.data),
    );
    return OK_200;
  }

  async deleteDraft(id: number) {
    await this.findOne(id);
    await this.redisService.del(`page-draft-${id}`);
    return this.findOne(id);
  }

  async saveRefText(updatePageDto: UpdatePageDto) {
    const dataSource = Database.getConnection();

    await dataSource.transaction(async (cnx) => {
      for (const section of updatePageDto.data.body['data']) {
        for (const row of section.rows) {
          for (const column of row.columns) {
            if (column.element === null) continue;
            if (!column.element?.dataText) continue;
            const textRefs = [];
            Object.keys(column.element.text).forEach((key) => {
              textRefs.push(key);
            });
            for (const textRef of textRefs) {
              const findReference = await this.referenceRepository.get(
                column.element.text[textRef],
              );
              if (findReference.length === 0) {
                const ref = randomCharacters('COMBINED', 16);
                column.element.text[textRef] = ref;
              }
            }
            for (const language of column.element.dataText) {
              const updatePromises = Object.keys(language)
                .filter((key) => key !== 'languageId')
                .map((key) =>
                  this.createOrUpdateRef(column, key, cnx, language),
                );

              await Promise.all(updatePromises);
            }
            delete column.element.dataText;
          }
        }
      }
    });

    return updatePageDto;
  }

  async createOrUpdateRef(
    column: ColumnI,
    key: string,
    cnx: EntityManager,
    language: ElementDataI,
  ) {
    const findReferenceLanguage = await this.referenceRepository.find(
      column.element.text[key],
      Number(language['languageId']),
    );

    if (!findReferenceLanguage) {
      await this.referenceRepository.create(
        {
          languageId: Number(language['languageId']),
          ref: column.element.text[key],
          text: language[key],
        },
        cnx,
      );
    } else {
      await this.referenceRepository.update(
        {
          languageId: Number(language['languageId']),
          ref: column.element.text[key],
          text: language[key],
        },
        cnx,
      );
    }

    return column;
  }

  async replaceRefText(data: PageDataMongoI) {
    data = JSON.parse(JSON.stringify(data));
    for (const section of data.body['data']) {
      for (const row of section.rows) {
        for (const column of row.columns) {
          if (column.element === null) continue;
          const textRefs = [];
          Object.keys(column.element.text).forEach((key) => {
            textRefs.push(key);
          });
          column.element.dataText = [];
          for (const textRef of textRefs) {
            const findReference = await this.referenceRepository.get(
              column.element.text[textRef],
            );
            findReference.forEach((reference) => {
              column.element.dataText.push({
                languageId: reference.languageId.toString(),
                [textRef]: reference.text,
              });
            });
          }
        }
      }
    }

    return data;
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

    let page: PageI;

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

    const pageRenderRedis = await this.redisService.get(
      `page-${page.id}-${params.lang}`,
    );

    if (pageRenderRedis) {
      response = JSON.parse(pageRenderRedis);
      return response;
    }

    const pageMongo = (await this.pageModel.findById(
      page.mongoId,
    )) as PageMongoI;
    page.data = await this.replaceRefText(pageMongo.data);
    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });

    page.details = [];

    for (let language of languages.records) {
      page.details.push({
        languageId: language.id,
        alias: await this.referenceRepository.find(page.aliasRef, language.id),
        description: await this.referenceRepository.find(
          page.descriptionRef,
          language.id,
        ),
        keywords: await this.referenceRepository.find(
          page.seoKeywordsRef,
          language.id,
        ),
      });
    }

    const path = page.micrositieId
      ? `/${params.lang}/${params.micrositie}/${page.path}`
      : `/${params.lang}/${page.path}`;

    const createdVisitPage = new this.visitModel({
      data: {
        pageId: page.id,
        name: page.name,
        lang: params.lang,
        micrositie: params.micrositie || null,
        path,
        sitieId: page.sitieId,
        createdAt: moment().format('YYYY-MM-DD'),
        visitAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
    });
    await createdVisitPage.save();

    response = { ...page, languageId: lang.id, languageCode: lang.lang };

    await this.redisService.set(
      `page-${page.id}-${params.lang}`,
      JSON.stringify(response),
    );

    return response;
  }

  async reviewPage(id: number, reviewPageDto: ReviewPageDto) {
    await this.pageRepository.updateReviewPage(id, reviewPageDto);
    return OK_200;
  }
}
