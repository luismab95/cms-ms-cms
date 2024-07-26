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
import { LanguagesService } from './languages.service';
import {
  CreateLanguageDto,
  LanguageI,
  UpdateLanguageDto,
} from './dto/language.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';

@Controller('languages')
@UseGuards(JwtGuard)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.languagesService.create(createLanguageDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<LanguageI[]>>> {
    return {
      message: await this.languagesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<LanguageI>> {
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
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.languagesService.update(
        Number(id),
        updateLanguageDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.languagesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
