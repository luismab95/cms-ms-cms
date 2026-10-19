import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel, Model, Redis } from 'cms-lib-database';
import { PaginationResquestDto, OK_200 } from 'cms-lib-resources';
import { SitieRepository } from '@modules/sitie/repositories/sitie.repository.js';
import {
  CreateTemplateDto,
  TemplateMongoI,
  UpdateTemplateDto,
} from '../dto/template.dto.js';
import { TemplateRepository } from '../repositories/template.repository.js';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly sitieRepository: SitieRepository,
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

  async findAll(paginationResquestDto: PaginationResquestDto, userId: number) {
    const templates = await this.templateRepository.get(
      paginationResquestDto,
      userId,
    );
    for (let template of templates.records) {
      const templateMongo = (await this.templateModel.findById(
        template.mongoId,
      )) as TemplateMongoI;
      const draft = await Redis.get(`template-draft-${template.id}`);
      if (draft) template.draft = JSON.parse(draft);
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
    const draft = await Redis.get(`template-draft-${id}`);
    if (draft) template.draft = JSON.parse(draft);
    const templateMongo = (await this.templateModel.findById(
      template.mongoId,
    )) as TemplateMongoI;
    template.data = templateMongo.data;
    return template;
  }

  async update(id: number, updateTemplateDto: UpdateTemplateDto) {
    const template = await this.findOne(id);
    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      updateTemplateDto.status &&
      template.status !== updateTemplateDto.status &&
      sitie.templateId === id
    ) {
      throw new HttpException(
        'No se puede deshabilitar la plantilla actual del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateTemplateDto.data) {
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
      await this.deleteDraft(id);
    }
    await this.templateRepository.update(id, updateTemplateDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (sitie.templateId === id) {
      throw new HttpException(
        'No se puede deshabilitar la plantilla actual del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }
    template.status = !template.status;
    delete template.data;
    await this.templateRepository.update(
      id,
      template as unknown as UpdateTemplateDto,
    );
    return OK_200;
  }

  async saveDraft(id: number, updateTemplateDto: UpdateTemplateDto) {
    await this.findOne(id);
    await Redis.set(
      `template-draft-${id}`,
      JSON.stringify(updateTemplateDto.data),
    );
    return OK_200;
  }

  async deleteDraft(id: number) {
    await this.findOne(id);
    await Redis.del(`template-draft-${id}`);
    return this.findOne(id);
  }
}
