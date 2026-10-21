import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import moment from 'moment';
import { PagesService } from '@modules/pages/services/pages.service.js';
import { GetallDto } from '../dto/page-review.dto.js';
import { PageReviewRepository } from '../repositories/pages-review.repository.js';

moment.locale('es');
moment.tz.setDefault('America/Guayaquil');

@Injectable()
export class PagesReviewService {
  constructor(
    private readonly pageReviewRepository: PageReviewRepository,
    private readonly pageService: PagesService,
  ) {}

  async getAll(getallDto: GetallDto, userId: number) {
    return await this.pageReviewRepository.getAll(getallDto, userId);
  }

  async findOne(pageReviewId: number, userId: number) {
    const pageReview =
      await this.pageReviewRepository.findForReview(pageReviewId);
    if (pageReview === undefined) {
      throw new HttpException(
        'No se encontro datos de la página a revisar.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!pageReview.userReviewId) {
      await this.pageReviewRepository.updateReviewPage(pageReviewId, {
        ...pageReview,
        userReviewId: userId,
        statusReview: 'assigned',
      });
    }

    return this.pageService.findOne(pageReview.pageId);
  }

  // async reviewPage(id: number, reviewPageDto: ReviewPageDto) {
  //   await this.pageRepository.updateReviewPage(id, reviewPageDto);
  //   const pageReview = await this.pageRepository.findReview(id);

  //   if (pageReview === undefined) {
  //     throw new HttpException(
  //       'No se encontro datos de la página',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const rolesByNotify: number[] = [
  //     RolesIdEnum.design,
  //     RolesIdEnum.editor,
  //     RolesIdEnum.admin,
  //   ];

  //   if (reviewPageDto.status === 'approved') {
  //     const contentPage = await this.pageReviewModel.findById(
  //       pageReview.reviewMongoId,
  //     );

  //     await this.pageModel.findByIdAndUpdate(
  //       pageReview.mongoId,
  //       { data: contentPage?.data },
  //       { new: true },
  //     );
  //     await this.createOrUpdateRefFromReview(pageReview.id);

  //     const languages = await this.languageRepository.get({
  //       limit: 9999,
  //       page: 1,
  //       status: true,
  //       search: null,
  //     });
  //     for (let lang of languages.records) {
  //       await Redis.del(`page-${pageReview.id}-${lang.lang}`);
  //     }

  //     for (let role of rolesByNotify) {
  //       await this.createNotify({
  //         message: `Los cambios en la página <strong>${pageReview.name}</strong> han sido <em>aprobados</em>.`,
  //         path: `admin/modules/pages/detail`,
  //         roleId: role,
  //         metadata: {
  //           id: pageReview.id,
  //           micrositieId: pageReview.micrositieId,
  //         },
  //       } as unknown as NotifyI);
  //     }
  //   } else {
  //     for (let role of rolesByNotify) {
  //       await this.createNotify({
  //         message: `Los cambios en la página <strong>${pageReview.name}</strong> han sido <em>rechazados</em>.`,
  //         path: `admin/modules/pages/detail`,
  //         roleId: role,
  //         metadata: {
  //           id: pageReview.id,
  //           micrositieId: pageReview.micrositieId,
  //         },
  //       } as unknown as NotifyI);
  //     }
  //   }
  //   return OK_200;
  // }

  // private async createNotify(notify: NotifyI) {
  //   const createNotify = await this.notifyRepository.create({
  //     message: notify.message,
  //     path: notify.path,
  //     roleId: notify.roleId,
  //     metadata: notify.metadata,
  //     readStatus: false,
  //   } as unknown as NotifyI);

  //   this.notifyGateway.sendToUser(notify.roleId.toString(), createNotify);
  // }

  //  private async createOrUpdateRefFromReview(pageId: number) {
  //   const getAllRefReview =
  //     await this.referenceRepository.getRefReviewByPageId(pageId);

  //   const dataSource = Database.getConnection();
  //   await dataSource.transaction(async (cnx) => {
  //     for (let refReview of getAllRefReview) {
  //       const findReference = await this.referenceRepository.find(
  //         refReview.ref,
  //         refReview.languageId,
  //       );

  //       if (!findReference) {
  //         await this.referenceRepository.create(
  //           {
  //             languageId: refReview.languageId,
  //             ref: refReview.ref,
  //             text: refReview.text,
  //             pageId,
  //           },
  //           cnx,
  //         );
  //       } else {
  //         await this.referenceRepository.update(
  //           {
  //             languageId: findReference.languageId,
  //             ref: findReference.ref,
  //             text: refReview.text,
  //             pageId,
  //           },
  //           cnx,
  //         );
  //       }
  //     }
  //   });
  // }
}
