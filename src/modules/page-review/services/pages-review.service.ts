import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import {
  Database,
  EntityManager,
  InjectModel,
  Model,
  Redis,
} from 'cms-lib-database';
import { OK_200, RolesIdEnum } from 'cms-lib-resources';
import { NotifyI } from '@modules/notify/dto/notify.dto.js';
import { PageI, PageMongoI } from '@modules/pages/dto/page.dto.js';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { LanguageRepository } from '@modules/languages/repositories/language.repository.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { ReferenceRepository } from '@shared/repositories/reference.repository.js';
import {
  GetallDto,
  ReviewPageDataI,
  ReviewPageDto,
} from '../dto/page-review.dto.js';
import { PageReviewRepository } from '../repositories/pages-review.repository.js';
import { NotifyRepository } from '@modules/notify/repositories/notify.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';

moment.locale('es');
moment.tz.setDefault('America/Guayaquil');

@Injectable()
export class PagesReviewService {
  constructor(
    private readonly referenceRepository: ReferenceRepository,
    private readonly pageReviewRepository: PageReviewRepository,
    private readonly languageRepository: LanguageRepository,
    private readonly permissionSitieRepository: PermissionSitieRepository,
    private readonly notifyRepository: NotifyRepository,
    private readonly notifyGateway: NotifyGateway,
    private readonly pageService: PagesService,
    @InjectModel('Review')
    private readonly pageReviewModel: Model<PageMongoI>,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
  ) {}

  async getAll(getallDto: GetallDto, userId: number) {
    return await this.pageReviewRepository.getAll(getallDto, userId);
  }

  async findOne(pageReviewId: number, userId: number) {
    const dataSource = Database.getConnection();
    return await dataSource.transaction(async (cnx) => {
      const pageReview = await this.pageReviewRepository.findForReview(
        pageReviewId,
        cnx,
      );
      if (pageReview === undefined) {
        throw new HttpException(
          'No se encontro datos de la página a revisar.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (pageReview.statusReview === 'pending') {
        await this.pageReviewRepository.updateReviewPage(
          pageReviewId,
          {
            userReviewId: userId,
            statusReview: 'assigned',
          } as ReviewPageDataI,
          cnx,
        );
      }
      return this.pageService.findOne(pageReview.pageId);
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
          'No se encontro datos de la revisión de la página',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (reviewPageDto.status === 'approved') {
        const contentPage = await this.pageReviewModel.findById(
          pageReview.mongoId,
        );

        await this.pageModel.findByIdAndUpdate(
          pageReview.mongoId,
          { data: contentPage?.data },
          { new: true },
        );
        await this.createOrUpdateRefFromReview(pageReview.pageId, cnx);

        const languages = await this.languageRepository.get({
          limit: 9999,
          page: 1,
          status: true,
          search: null,
        });
        for (let lang of languages.records) {
          await Redis.del(`page-${pageReview.id}-${lang.lang}`);
        }

        const page = await this.pageService.findOne(pageReview.pageId);
        if (page === undefined) {
          throw new HttpException(
            'No se encontro datos de la página',
            HttpStatus.BAD_REQUEST,
          );
        }

        for (let role of rolesByNotify) {
          await this.createNotify(
            page,
            `Los cambios de la página ${page.name} fueron aprobados.`,
            role,
            pageReview,
            cnx,
          );
        }
      } else {
        const page = await this.pageService.findOne(pageReview.pageId);
        if (page === undefined) {
          throw new HttpException(
            'No se encontro datos de la página',
            HttpStatus.BAD_REQUEST,
          );
        }
        for (let role of rolesByNotify) {
          await this.createNotify(
            page,
            `Los cambios de la página ${page.name} fueron rechazados.`,
            role,
            pageReview,
            cnx,
          );
        }
      }
    });
    return OK_200;
  }

  private async createNotify(
    page: PageI,
    message: string,
    roleId: number,
    reviewPageData: ReviewPageDataI,
    cnx: EntityManager,
  ) {
    const { id, comment, statusReview, userReview, userChanges, pageId } =
      reviewPageData;

    let createNotifies: NotifyI[] = [];
    const usersToNotifyData = await this.permissionSitieRepository.findByRole(
      roleId,
      page.sitieId,
      page.micrositieId,
    );
    const usersToNotify = usersToNotifyData.map((item) => item.userId);
    for (const userId of usersToNotify) {
      const newNotify = {
        message,
        readStatus: false,
        metadata: {
          pageIdReviewId: id,
          comment,
          pageId,
          entityName: page.name,
          micrositieId: page.micrositieId,
          statusReview,
          userReview,
          userChanges,
        },
        userId,
      } as NotifyI;
      const createNotify = await this.notifyRepository.create(newNotify, cnx);
      newNotify.id = createNotify.id;
      createNotifies.push(createNotify);
    }

    for (const notify of createNotifies) {
      this.notifyGateway.sendToUser(notify.userId.toString(), notify);
    }
  }

  private async createOrUpdateRefFromReview(
    pageId: number,
    cnx: EntityManager,
  ) {
    const getAllRefReview =
      await this.referenceRepository.getRefReviewByPageId(pageId);
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
            pageId,
          },
          cnx,
        );
      } else {
        await this.referenceRepository.update(
          {
            languageId: findReference.languageId,
            ref: findReference.ref,
            text: refReview.text,
            pageId,
          },
          cnx,
        );
      }
    }
  }
}
