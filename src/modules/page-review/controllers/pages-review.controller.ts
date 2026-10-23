import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  JwtGuard,
  ServiceResponseI,
  PaginationResponseI,
} from 'cms-lib-resources';
import { PageI } from '@modules/pages/dto/page.dto.js';
import {
  ReviewPageDataI,
  GetallDto,
  ReviewPageDto,
} from '../dto/page-review.dto.js';
import { PagesReviewService } from '../services/pages-review.service.js';

@Controller('reviews/page')
@UseGuards(JwtGuard)
export class PagesReviewController {
  constructor(private readonly pagesReviewService: PagesReviewService) {}

  @Get('')
  @UsePipes(new ValidationPipe())
  async findAllReview(
    @Query() GetallDto: GetallDto,
    @Req() req: Request,
  ): Promise<ServiceResponseI<PaginationResponseI<ReviewPageDataI[]>>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.pagesReviewService.getAll(GetallDto, userId),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  async findOneReview(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ServiceResponseI<PageI>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.pagesReviewService.findOne(Number(id), userId),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async rejectReviewPage(
    @Param('id') id: string,
    @Body() ReviewPageDto: ReviewPageDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.pagesReviewService.reviewPage(
        Number(id),
        ReviewPageDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }
}
