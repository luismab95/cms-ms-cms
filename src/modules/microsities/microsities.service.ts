import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMicrosityDto, UpdateMicrosityDto } from './dto/microsity.dto';
import { MicrosityRepository } from './repositories/microsities.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { stringToSlug } from 'src/shared/helpers/string.helper';
import { Database } from 'lib-database/src/shared/config/database';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePageDto, PageMongoI } from '../pages/dto/page.dto';
import { Model } from 'mongoose';
import { createPage } from 'src/shared/helpers/page.helper';
import { PageRepository } from '../pages/repositories/page.repository';

@Injectable()
export class MicrositiesService {
  constructor(
    private readonly microsityRepository: MicrosityRepository,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
  ) {}

  async create(createMicrosityDto: CreateMicrosityDto) {
    createMicrosityDto.path = stringToSlug(createMicrosityDto.name);

    const dataSource = Database.getConnection();
    return dataSource.transaction(async (cnx) => {
      const newMicrositie = await this.microsityRepository.create(
        createMicrosityDto,
        cnx,
      );

      const createdPage = new this.pageModel({
        data: {
          body: {
            css: '.body{min-height: 80vh !important}',
            config: {
              backgroundImage: '',
            },
            data: [],
          },
        },
      });
      const pageData = await createdPage.save();
      const createPageDto = {
        mongoId: String(pageData._id),
        micrositieId: newMicrositie.id,
        isHomePage: true,
        path: 'inicio',
        name: createMicrosityDto.name,
      } as CreatePageDto;
      await createPage(createPageDto, cnx);

      return newMicrositie;
    });
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    return await this.microsityRepository.get(paginationResquestDto);
  }

  async findOne(value: any, code: string) {
    const micrositie = await this.microsityRepository.find(code, value);
    micrositie.path = `${micrositie.path}/${micrositie.pathPage}`;
    if (micrositie === undefined) {
      throw new HttpException(
        'No se encontro datos del micrositio',
        HttpStatus.BAD_REQUEST,
      );
    }
    return micrositie;
  }

  async update(id: number, updateMicrosityDto: UpdateMicrosityDto) {
    await this.microsityRepository.update(id, updateMicrosityDto);
    return await this.findOne(id, 'id');
  }

  async remove(id: number) {
    const micrositie = await this.findOne(id, 'id');
    micrositie.status = !micrositie.status;
    await this.microsityRepository.update(
      id,
      micrositie as unknown as UpdateMicrosityDto,
    );
    return OK_200;
  }
}
