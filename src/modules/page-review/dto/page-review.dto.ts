import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  PageReviewStatusT,
  ReviewCommentI,
  TypeReviewT,
} from 'cms-lib-database';
import { PaginationResquestDto } from 'cms-lib-resources';
import { PageDataMongoI, PageI } from '@modules/pages/dto/page.dto.js';
import {
  TemplateDataMongoI,
  TemplateI,
} from '@modules/templates/dto/template.dto.js';

export interface ReviewEntityI {
  id: number;
  status: PageReviewStatusT;
  type: TypeReviewT;
  data: PageI | TemplateI;
}

export interface ReviewPageDataI extends Partial<
  Pick<PageI, 'name' | 'path' | 'status'>
> {
  id: number;
  pageId: number | null;
  templateId: number | null;
  comment: string;
  type: TypeReviewT;
  comments: ReviewCommentI[];
  mongoId: string;
  statusReview: PageReviewStatusT;
  userChangesId: number;
  userReviewId: number;
  userReview?: string;
  userChanges?: string;
  dataReview?: PageDataMongoI | TemplateDataMongoI;
}

export class ReviewPageDto {
  @IsArray({ message: 'Comentarios debe ser un array' })
  comments: ReviewCommentI[];

  @IsString({ message: 'Comentario debe ser texto' })
  @IsOptional()
  comment: string;

  @IsString({ message: 'Estado debe ser texto' })
  @IsNotEmpty({ message: 'Estado es requerido' })
  status: PageReviewStatusT;
}

export class GetallDto extends PaginationResquestDto {
  @IsIn(['pending', 'assigned', 'approved', 'rejected'], {
    message: 'Estado de revisión no válido',
  })
  @IsOptional()
  statusReview?: PageReviewStatusT | null;
}
