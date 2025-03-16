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
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto, GetallDto, PageI } from './dto/page.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { PaginationResponseI } from 'src/shared/interfaces/pagination.interface';

@Controller('pages')
@UseGuards(JwtGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createPageDto: CreatePageDto,
  ): Promise<ServiceResponseInterface<PageI>> {
    return {
      message: await this.pagesService.create(createPageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  async findAll(
    @Query() GetallDto: GetallDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<PageI[]>>> {
    return {
      message: await this.pagesService.findAll(GetallDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<PageI>> {
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
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.pagesService.saveDraft(
        Number(id),
        updatePageDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<ServiceResponseInterface<PageI>> {
    return {
      message: await this.pagesService.update(Number(id), updatePageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('draft/:id')
  async deleteDraft(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<PageI>> {
    return {
      message: await this.pagesService.deleteDraft(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }


  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.pagesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
