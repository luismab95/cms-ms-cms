import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreatePageDto,
  GetallDto,
  PageMongoI,
  UpdatePageDto,
} from './dto/page.dto';
import { PageRepository } from './repositories/page.repository';
import { RedisService } from 'src/shared/redis/redis.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OK_200 } from 'src/shared/constants/message.constants';
import { ReferenceRepository } from 'src/shared/repositories/reference.repository';
import { LanguageRepository } from '../languages/repositories/language.repository';
import { Database } from 'lib-database/src/shared/config/database';
import { createPage } from 'src/shared/helpers/page.helper';

@Injectable()
export class PagesService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly referenceRepository: ReferenceRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly redisService: RedisService,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
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
    page.data = pageMongo.data;

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
    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto) {
    const page = await this.findOne(id);

    if (page.data) {
      const updatePage = await this.pageModel
        .findByIdAndUpdate(page.mongoId, updatePageDto, {
          new: false,
        })
        .exec();
      if (!updatePage) {
        throw new HttpException(
          'No se encontro datos de la página',
          HttpStatus.BAD_REQUEST,
        );
      }
      delete updatePageDto.data;
      await this.deleteDraft(id);
    }

    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
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
}
