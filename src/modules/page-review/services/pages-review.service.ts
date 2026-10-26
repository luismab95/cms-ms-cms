import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import {
  Database,
  EntityManager,
  InjectModel,
  Model,
  Redis,
  TypeReviewT,
} from 'cms-lib-database';
import { OK_200, RolesIdEnum } from 'cms-lib-resources';
import { PageI, PageMongoI } from '@modules/pages/dto/page.dto.js';
import { PagesService } from '@modules/pages/services/pages.service.js';
import {
  TemplateI,
  TemplateMongoI,
} from '@modules/templates/dto/template.dto.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';
import { TemplatesService } from '@modules/templates/services/templates.service.js';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import { createNotify } from '@shared/helpers/notify.helper.js';
import {
  GetallDto,
  ReviewPageDataI,
  ReviewPageDto,
} from '../dto/page-review.dto.js';
import { PageReviewRepository } from '../repositories/pages-review.repository.js';

moment.locale('es');
moment.tz.setDefault('America/Guayaquil');

@Injectable()
export class PagesReviewService {
  constructor(
    private readonly referenceRepository: ReferenceRepository,
    private readonly pageReviewRepository: PageReviewRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly sitieRepository: SitieRepository,
    private readonly notifyGateway: NotifyGateway,
    private readonly pageService: PagesService,
    private readonly templateService: TemplatesService,
    @InjectModel('ReviewPages')
    private readonly pageReviewModel: Model<PageMongoI>,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
    @InjectModel('ReviewTemplates')
    private readonly templateReviewModel: Model<TemplateMongoI>,
    @InjectModel('Template')
    private readonly templateModel: Model<TemplateMongoI>,
  ) {}

  async getAll(getallDto: GetallDto, userId: number) {
    return await this.pageReviewRepository.getAll(getallDto, userId);
  }

  async findOne(reviewId: number, userId: number) {
    const dataSource = Database.getConnection();
    return await dataSource.transaction(async (cnx) => {
      const pageReview = await this.pageReviewRepository.findForReview(
        reviewId,
        cnx,
      );
      if (pageReview === undefined) {
        throw new HttpException(
          'No se encontro datos de la revisión.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (pageReview.statusReview === 'pending') {
        await this.pageReviewRepository.updateReviewPage(
          reviewId,
          {
            userReviewId: userId,
            statusReview: 'assigned',
          } as ReviewPageDataI,
          cnx,
        );
      }
      let data: PageI | TemplateI;
      if (pageReview.type === 'page') {
        data = await this.pageService.findOne(pageReview.pageId!);
      } else {
        data = await this.templateService.findOne(pageReview.templateId!);
      }
      return {
        id: pageReview.id,
        status: pageReview.statusReview,
        type: pageReview.type,
        data,
      };
    });
  }

  async reviewPage(id: number, reviewPageDto: ReviewPageDto) {
    const { comment, status, comments } = reviewPageDto;
    const dataSource = Database.getConnection();
    const rolesByNotify: number[] = [
      RolesIdEnum.design,
      RolesIdEnum.editor,
      RolesIdEnum.admin,
    ];

    await dataSource.transaction(async (cnx) => {
      const updatePageReview = {
        comment,
        comments,
        statusReview: status,
      } as ReviewPageDataI;
      await this.pageReviewRepository.updateReviewPage(
        id,
        updatePageReview,
        cnx,
      );

      const pageReview = await this.pageReviewRepository.findForReview(id, cnx);
      if (pageReview === undefined) {
        throw new HttpException(
          'No se encontro datos de la revisión.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (reviewPageDto.status === 'approved') {
        if (pageReview.type === 'page') {
          await this.approvedPageReview(pageReview, rolesByNotify, cnx);
        } else {
          await this.approvedTemplateReview(pageReview, rolesByNotify, cnx);
        }
      } else {
        if (pageReview.type === 'page') {
          await this.rejectedPageReview(pageReview, rolesByNotify, cnx);
        } else {
          await this.rejectedTemplateReview(pageReview, rolesByNotify, cnx);
        }
      }
    });
    return OK_200;
  }

  private async notifyUsers(
    rolesByNotify: number[],
    entityId: number,
    entityName: string,
    sitieId: number,
    micrositieId: number | null,
    typeReview: TypeReviewT,
    message: string,
    cnx: EntityManager,
  ) {
    for (let role of rolesByNotify) {
      await createNotify(
        entityId,
        entityName,
        sitieId,
        micrositieId,
        typeReview,
        message,
        role,
        this.notifyGateway,
        cnx,
      );
    }
  }

  private async approvedPageReview(
    pageReview: ReviewPageDataI,
    rolesByNotify: number[],
    cnx: EntityManager,
  ) {
    const page = await this.pageService.findOne(pageReview.pageId!);
    if (page === undefined) {
      throw new HttpException(
        'No se encontro datos de la página',
        HttpStatus.BAD_REQUEST,
      );
    }

    const contentPage = await this.pageReviewModel.findById(pageReview.mongoId);
    await this.pageModel.findByIdAndUpdate(
      page.mongoId,
      { data: contentPage?.data },
      { new: true },
    );
    await this.createOrUpdateRefFromReview(
      pageReview.pageId!,
      pageReview.type,
      cnx,
    );

    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });
    for (let lang of languages.records) {
      await Redis.del(`page-${pageReview.pageId}-${lang.lang}`);
    }

    await this.notifyUsers(
      rolesByNotify,
      page.id,
      page.name,
      page.sitieId,
      page.micrositieId,
      pageReview.type,
      `Los cambios de la página ${page.name} fueron aprobados.`,
      cnx,
    );
  }

  private async approvedTemplateReview(
    pageReview: ReviewPageDataI,
    rolesByNotify: number[],
    cnx: EntityManager,
  ) {
    const template = await this.templateService.findOne(pageReview.templateId!);
    if (template === undefined) {
      throw new HttpException(
        'No se encontro datos de la plantilla',
        HttpStatus.BAD_REQUEST,
      );
    }

    const contentPage = await this.templateReviewModel.findById(
      pageReview.mongoId,
    );

    await this.templateModel.findByIdAndUpdate(
      template.mongoId,
      { data: contentPage?.data },
      { new: true },
    );
    await this.createOrUpdateRefFromReview(
      pageReview.templateId!,
      pageReview.type,
      cnx,
    );

    const languages = await this.languageRepository.get({
      limit: 9999,
      page: 1,
      status: true,
      search: null,
    });
    for (let lang of languages.records) {
      await Redis.del(`template-${pageReview.templateId}-${lang.lang}`);
    }

    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.notifyUsers(
      rolesByNotify,
      template.id,
      template.name,
      sitie.id!,
      null,
      pageReview.type,
      `Los cambios de la plantilla ${template.name} fueron aprobados.`,
      cnx,
    );
  }

  private async rejectedPageReview(
    pageReview: ReviewPageDataI,
    rolesByNotify: number[],
    cnx: EntityManager,
  ) {
    const page = await this.pageService.findOne(pageReview.pageId!);
    if (page === undefined) {
      throw new HttpException(
        'No se encontro datos de la página',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.notifyUsers(
      rolesByNotify,
      page.id,
      page.name,
      page.sitieId,
      page.micrositieId,
      pageReview.type,
      `Los cambios de la página ${page.name} fueron rechazados.`,
      cnx,
    );
  }

  private async rejectedTemplateReview(
    pageReview: ReviewPageDataI,
    rolesByNotify: number[],
    cnx: EntityManager,
  ) {
    const template = await this.templateService.findOne(pageReview.templateId!);
    if (template === undefined) {
      throw new HttpException(
        'No se encontro datos de la plantilla',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.notifyUsers(
      rolesByNotify,
      template.id,
      template.name,
      sitie.id!,
      null,
      pageReview.type,
      `Los cambios de la plantilla ${template.name} fueron rechazados.`,
      cnx,
    );
  }

  private async createOrUpdateRefFromReview(
    entityId: number,
    typeReview: TypeReviewT,
    cnx: EntityManager,
  ) {
    const getAllRefReview = await this.referenceRepository.getRefReviewByPageId(
      entityId,
      typeReview,
    );
    for (let refReview of getAllRefReview) {
      const findReference = await this.referenceRepository.find(
        refReview.ref,
        refReview.languageId,
      );

      if (!findReference) {
        await this.referenceRepository.create(
          {
            languageId: refReview.languageId,
            ref: refReview.ref,
            text: refReview.text,
            type: typeReview,
            pageId: typeReview === 'page' ? entityId : null,
            templateId: typeReview === 'template' ? entityId : null,
          },
          cnx,
        );
      } else {
        await this.referenceRepository.update(
          {
            languageId: findReference.languageId,
            ref: findReference.ref,
            text: refReview.text,
            type: typeReview,
            pageId: typeReview === 'page' ? entityId : null,
            templateId: typeReview === 'template' ? entityId : null,
          },
          cnx,
        );
      }
    }
  }
}
