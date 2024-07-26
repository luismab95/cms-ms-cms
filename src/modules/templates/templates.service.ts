import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateTemplateDto,
  TemplateMongoI,
  UpdateTemplateDto,
} from './dto/template.dto';
import { TemplateRepository } from './repositories/template.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    @InjectModel('Template')
    private readonly templateModel: Model<TemplateMongoI>,
  ) {}

  async create(createTemplateDto: CreateTemplateDto) {
    const createdTemplate = new this.templateModel(createTemplateDto);
    const templateData = await createdTemplate.save();
    createTemplateDto.mongoId = String(templateData._id);
    const newTemplate = await this.templateRepository.create(createTemplateDto);
    return this.findOne(newTemplate.id);
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    const templates = await this.templateRepository.get(paginationResquestDto);
    for (let template of templates.records) {
      const templateMongo = (await this.templateModel.findById(
        template.mongoId,
      )) as TemplateMongoI;
      template.data = templateMongo.data;
    }
    return templates;
  }

  async findOne(id: number) {
    const template = await this.templateRepository.find('id', id);
    if (template === undefined) {
      throw new HttpException(
        'No se encontro datos de la plantilla',
        HttpStatus.BAD_REQUEST,
      );
    }
    const templateMongo = (await this.templateModel.findById(
      template.mongoId,
    )) as TemplateMongoI;
    template.data = templateMongo.data;
    return template;
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.findOne(id);
    const updateTemplate = await this.templateModel
      .findByIdAndUpdate(template.mongoId, updateTemplateDto, {
        new: false,
      })
      .exec();
    if (!updateTemplate) {
      throw new HttpException(
        'No se encontro datos de la plantilla',
        HttpStatus.BAD_REQUEST,
      );
    }
    delete updateTemplateDto.data;
    await this.templateRepository.update(id, updateTemplateDto);
    const updatedTemplate = await this.findOne(id);
    return updatedTemplate;
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    template.status = !template.status;
    delete template.data;
    await this.templateRepository.update(
      id,
      template as unknown as UpdateTemplateDto,
    );
    return OK_200;
  }
}
