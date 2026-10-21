import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { PageReviewStatus } from 'cms-lib-database';
import { PageDataMongoI, PageI } from '@modules/pages/dto/page.dto.js';
import { PaginationResquestDto } from 'cms-lib-resources';

export interface ReviewPageDataI extends Partial<
  Pick<PageI, 'name' | 'path' | 'status'>
> {
  id: number;
  pageId: number;
  comment: string;
  mongoId: string;
  statusReview: PageReviewStatus;
  userChangesId: number;
  userReviewId: number;
  userReview?: string;
  userChanges?: string;
  dataReview?: PageDataMongoI;
}

export class ReviewPageDto {
  @IsString({ message: 'Comentario debe ser texto' })
  @IsNotEmpty({ message: 'Comentario es requerido' })
  comment: string;

  @IsString({ message: 'Estado debe ser texto' })
  @IsNotEmpty({ message: 'Estado es requerido' })
  status: PageReviewStatus;
}

export class GetallDto extends PaginationResquestDto {
  @IsIn(['pending', 'assigned', 'approved', 'rejected'], {
    message: 'Estado de revisión no válido',
  })
  @IsOptional()
  statusReview?: PageReviewStatus | null;
}
