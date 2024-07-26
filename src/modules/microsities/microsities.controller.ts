import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { MicrositiesService } from './microsities.service';
import {
  CreateMicrosityDto,
  MicrositieI,
  UpdateMicrosityDto,
} from './dto/microsity.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import {
  PaginationResponseI,
  PaginationResquestDto,
} from 'src/shared/interfaces/pagination.interface';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';

@Controller('microsities')
@UseGuards(JwtGuard)
export class MicrositiesController {
  constructor(private readonly micrositiesService: MicrositiesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createMicrosityDto: CreateMicrosityDto,
  ): Promise<ServiceResponseInterface<MicrositieI>> {
    return {
      message: await this.micrositiesService.create(createMicrosityDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseInterface<PaginationResponseI<MicrositieI[]>>> {
    return {
      message: await this.micrositiesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<MicrositieI>> {
    return {
      message: await this.micrositiesService.findOne(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateMicrosityDto: UpdateMicrosityDto,
  ): Promise<ServiceResponseInterface<MicrositieI>> {
    return {
      message: await this.micrositiesService.update(
        Number(id),
        updateMicrosityDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.micrositiesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
