import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateSitieDto } from './dto/sitie.dto';
import { SitieRepository } from './repositories/sitie.repository';
import { OK_200 } from 'src/shared/constants/message.constants';

@Injectable()
export class SitieService {
  constructor(private readonly sitieRepository: SitieRepository) {}

  async findOne() {
    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }
    return sitie;
  }

  async update(id: number, updateSitieDto: UpdateSitieDto) {
    await this.findOne();
    await this.sitieRepository.update(id, updateSitieDto);
    return await this.findOne();
  }

  async remove(id: number) {
    const sitie = await this.findOne();
    sitie.status = !sitie.status;
    await this.sitieRepository.update(id, sitie as unknown as UpdateSitieDto);
    return OK_200;
  }
}
