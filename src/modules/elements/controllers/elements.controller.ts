import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  JwtGuard,
  PaginationResponseI,
  PaginationResquestDto,
  ServiceResponseI,
} from 'cms-lib-resources';
import { ElementCMSI } from '../dto/element.dto.js';
import { ElementsService } from '../services/elements.service.js';

@Controller('elements')
@UseGuards(JwtGuard)
export class ElementsController {
  constructor(private readonly elementsService: ElementsService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseI<PaginationResponseI<ElementCMSI[]>>> {
    return {
      message: await this.elementsService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }
}
