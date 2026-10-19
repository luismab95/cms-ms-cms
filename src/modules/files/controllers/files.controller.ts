import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  JwtGuard,
  ServiceResponseI,
  PaginationResponseI,
} from 'cms-lib-resources';
import { FilesService } from '../services/files.service.js';
import {
  CreateFileDto,
  PaginationFileResquestDto,
  FileI,
  UpdateFileDto,
} from '../dto/file.dto.js';

@Controller('files')
@UseGuards(JwtGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createFileDto: CreateFileDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.filesService.create(createFileDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationFileResquestDto,
  ): Promise<ServiceResponseI<PaginationResponseI<FileI[]>>> {
    return {
      message: await this.filesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<FileI>> {
    return {
      message: await this.filesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.filesService.update(Number(id), updateFileDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.filesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
