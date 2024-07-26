import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMicrosityDto, UpdateMicrosityDto } from './dto/microsity.dto';
import { MicrosityRepository } from './repositories/microsities.repository';
import { OK_200 } from 'src/shared/constants/message.constants';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';
import { stringToSlug } from 'src/shared/helpers/string.helper';

@Injectable()
export class MicrositiesService {
  constructor(private readonly microsityRepository: MicrosityRepository) {}

  async create(createMicrosityDto: CreateMicrosityDto) {
    createMicrosityDto.path = stringToSlug(createMicrosityDto.name);
    return await this.microsityRepository.create(createMicrosityDto);
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    const languages = await this.microsityRepository.get(paginationResquestDto);
    return languages;
  }

  async findOne(id: number) {
    const micrositie = await this.microsityRepository.find('id', id);
    if (micrositie === undefined) {
      throw new HttpException(
        'No se encontro datos del micrositio',
        HttpStatus.BAD_REQUEST,
      );
    }
    return micrositie;
  }

  async update(id: number, updateMicrosityDto: UpdateMicrosityDto) {
    await this.findOne(id);
    await this.microsityRepository.update(id, updateMicrosityDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const micrositie = await this.findOne(id);
    micrositie.status = !micrositie.status;
    await this.microsityRepository.update(
      id,
      micrositie as unknown as UpdateMicrosityDto,
    );
    return OK_200;
  }
}
