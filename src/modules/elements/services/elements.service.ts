import { Injectable } from '@nestjs/common';
import { PaginationResquestDto } from 'cms-lib-resources';
import { ElementRepository } from '../repositories/element.repository.js';

@Injectable()
export class ElementsService {
  constructor(private readonly elementRepository: ElementRepository) {}

  async findAll(paginationResquestDto: PaginationResquestDto) {
    return await this.elementRepository.get(paginationResquestDto);
  }
}
