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
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import {
  CreateTemplateDto,
  TemplateI,
  UpdateTemplateDto,
} from './dto/template.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('templates')
@UseGuards(JwtGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<ServiceResponseInterface<TemplateI>> {
    return {
      message: await this.templatesService.create(createTemplateDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<TemplateI[]>>> {
    return {
      message: await this.templatesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<TemplateI>> {
    return {
      message: await this.templatesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('draft/:id')
  @UsePipes(new ValidationPipe())
  async saveDraft(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.templatesService.saveDraft(
        Number(id),
        updateTemplateDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<ServiceResponseInterface<TemplateI>> {
    return {
      message: await this.templatesService.update(
        Number(id),
        updateTemplateDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('draft/:id')
  async deleteDraft(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<TemplateI>> {
    return {
      message: await this.templatesService.deleteDraft(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.templatesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
