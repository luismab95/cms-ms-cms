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
import { FilesService } from './files.service';
import { CreateFileDto, FileI, UpdateFileDto } from './dto/file.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('files')
@UseGuards(JwtGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createFileDto: CreateFileDto,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.filesService.create(createFileDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<FileI[]>>> {
    return {
      message: await this.filesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<FileI>> {
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
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.filesService.update(Number(id), updateFileDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.filesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
