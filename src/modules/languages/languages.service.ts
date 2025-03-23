import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/language.dto';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { LanguageRepository } from './repositories/language.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { ReferenceRepository } from '../../shared/repositories/reference.repository';
import { Database } from 'lib-database/src/shared/config/database';

@Injectable()
export class LanguagesService {
  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly referenceRepository: ReferenceRepository,
  ) {}

  async create(createLanguageDto: CreateLanguageDto) {
    const dataSource = Database.getConnection();

    await dataSource.transaction(async (cnx) => {
      const createLanguage = await this.languageRepository.create(
        createLanguageDto,
        cnx,
      );
      const references = await this.referenceRepository.getAll(cnx);
      for (const reference of references) {
        await this.referenceRepository.create(
          {
            ref: reference.ref,
            languageId: createLanguage.id,
            text: reference.text,
            pageId: reference.pageId,
          },
          cnx,
        );
      }
    });

    return OK_200;
  }

  async getAll() {
    const languages = await this.languageRepository.getAll();
    return languages;
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    const languages = await this.languageRepository.get(paginationResquestDto);
    return languages;
  }

  async findOne(id: number) {
    const language = await this.languageRepository.find('id', id);
    if (language === undefined) {
      throw new HttpException(
        'No se encontro datos del idioma',
        HttpStatus.BAD_REQUEST,
      );
    }
    return language;
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    await this.findOne(id);
    await this.languageRepository.update(id, updateLanguageDto);
    return OK_200;
  }

  async remove(id: number) {
    const language = await this.findOne(id);
    language.status = !language.status;
    await this.languageRepository.update(
      id,
      language as unknown as UpdateLanguageDto,
    );
    return OK_200;
  }
}
