import { HttpException, HttpStatus } from '@nestjs/common';
import { EntityManager, TypeReviewT } from 'cms-lib-database';
import { NotifyI } from '@modules/notify/dto/notify.dto.js';
import { PageReviewRepository } from '@modules/page-review/repositories/pages-review.repository.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { NotifyRepository } from '@modules/notify/repositories/notify.repository.js';
import { NotifyGateway } from '@modules/notify/services/notify.gateway.js';

export async function createNotify(
  entityId: number,
  entityName: string,
  sitieId: number,
  micrositieId: number | null,
  typeReview: TypeReviewT,
  message: string,
  roleId: number,
  notifyGateway: NotifyGateway,
  cnx: EntityManager,
) {
  const pageReviewRepository = new PageReviewRepository();
  const permissionSitieRepository = new PermissionSitieRepository();
  const notifyRepository = new NotifyRepository();

  const reviewPageData = await pageReviewRepository.findPageReview(
    entityId,
    typeReview,
    cnx,
  );
  if (!reviewPageData) {
    throw new HttpException(
      'Datos de revisión no encontrados',
      HttpStatus.NOT_FOUND,
    );
  }

  const { id, comment, statusReview, userReview, userChanges, pageId, type } =
    reviewPageData;

  let createNotifies: NotifyI[] = [];
  const usersToNotifyData = await permissionSitieRepository.findByRole(
    roleId,
    sitieId,
    micrositieId,
  );
  const usersToNotify = usersToNotifyData.map((item) => item.userId);

  for (const userId of usersToNotify) {
    const newNotify = {
      message,
      readStatus: false,
      metadata: {
        reviewId: id,
        comment,
        pageId,
        entityName: entityName,
        micrositieId,
        statusReview,
        userReview,
        userChanges,
        type,
      },
      userId,
    } as NotifyI;
    const createNotify = await notifyRepository.create(newNotify, cnx);
    newNotify.id = createNotify.id;
    createNotifies.push(createNotify);
  }

  for (const notify of createNotifies) {
    notifyGateway.sendToUser(notify.userId.toString(), notify);
  }
}
