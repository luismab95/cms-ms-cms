import { Injectable } from '@nestjs/common';
import { ElementRepository } from './repositories/element.repository';
import { PaginationResquestDto } from 'src/shared/interfaces/pagination.interface';

@Injectable()
export class ElementsService {
  constructor(private readonly elementRepository: ElementRepository) {}

  async findAll(paginationResquestDto: PaginationResquestDto) {
    return await this.elementRepository.get(paginationResquestDto);
  }
}
