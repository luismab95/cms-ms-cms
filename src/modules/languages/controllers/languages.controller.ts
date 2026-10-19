import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  JwtGuard,
  ServiceResponseI,
  PaginationResquestDto,
  PaginationResponseI,
} from 'cms-lib-resources';
import { LanguagesService } from '../services/languages.service.js';
import {
  CreateLanguageDto,
  LanguageI,
  UpdateLanguageDto,
} from '../dto/language.dto.js';

@Controller('languages')
@UseGuards(JwtGuard)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.languagesService.create(createLanguageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseI<PaginationResponseI<LanguageI[]>>> {
    return {
      message: await this.languagesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<LanguageI>> {
    return {
      message: await this.languagesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.languagesService.update(
        Number(id),
        updateLanguageDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.languagesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
