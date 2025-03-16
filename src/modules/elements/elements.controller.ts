import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ElementsService } from './elements.service';
import {
  PaginationResquestDto,
  PaginationResponseI,
} from 'src/shared/interfaces/pagination.interface';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { ElementCMSI } from './dto/element.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('elements')
@UseGuards(JwtGuard)
export class ElementsController {
  constructor(private readonly elementsService: ElementsService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<ElementCMSI[]>>> {
    return {
      message: await this.elementsService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }
}
