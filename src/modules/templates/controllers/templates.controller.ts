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
  Req,
} from '@nestjs/common';
import {
  JwtGuard,
  ServiceResponseI,
  PaginationResquestDto,
  PaginationResponseI,
} from 'cms-lib-resources';
import { TemplatesService } from '../services/templates.service.js';
import {
  CreateTemplateDto,
  TemplateI,
  UpdateTemplateDto,
} from '../dto/template.dto.js';

@Controller('templates')
@UseGuards(JwtGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<ServiceResponseI<TemplateI>> {
    return {
      message: await this.templatesService.create(createTemplateDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
    @Req() req: Request,
  ): Promise<ServiceResponseI<PaginationResponseI<TemplateI[]>>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.templatesService.findAll(
        paginationResquestDto,
        userId,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ServiceResponseI<TemplateI>> {
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
  ): Promise<ServiceResponseI<string>> {
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
  ): Promise<ServiceResponseI<TemplateI>> {
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
  ): Promise<ServiceResponseI<TemplateI>> {
    return {
      message: await this.templatesService.deleteDraft(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.templatesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
