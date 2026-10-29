import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import {
  CreatePageDto,
  UpdatePageDto,
  GetallDto,
  PageI,
} from '../dto/page.dto.js';
import { PagesService } from '../services/pages.service.js';

@Controller('pages')
@UseGuards(JwtGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createPageDto: CreatePageDto,
  ): Promise<ServiceResponseI<PageI>> {
    return {
      message: await this.pagesService.create(createPageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() GetallDto: GetallDto,
    @Req() req: Request,
  ): Promise<ServiceResponseI<PaginationResponseI<PageI[]>>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.pagesService.findAll(GetallDto, userId),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<PageI>> {
    return {
      message: await this.pagesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('draft/:id')
  @UsePipes(new ValidationPipe())
  async saveDraft(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.pagesService.saveDraft(Number(id), updatePageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<ServiceResponseI<PageI>> {
    try {
      return {
        message: await this.pagesService.update(Number(id), updatePageDto),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  @Delete('draft/:id')
  @UsePipes(new ValidationPipe())
  async deleteDraft(@Param('id') id: string): Promise<ServiceResponseI<PageI>> {
    return {
      message: await this.pagesService.deleteDraft(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @UsePipes(new ValidationPipe())
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.pagesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
