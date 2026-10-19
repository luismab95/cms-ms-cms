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
  Req,
} from '@nestjs/common';
import {
  JwtGuard,
  ServiceResponseI,
  PaginationResquestDto,
  PaginationResponseI,
} from 'cms-lib-resources';
import { MicrositiesService } from '../services/microsities.service.js';
import {
  AssignUserMicrositieDto,
  CreateMicrosityDto,
  MicrositieI,
  UpdateMicrosityDto,
} from '../dto/microsity.dto.js';

@Controller('microsities')
@UseGuards(JwtGuard)
export class MicrositiesController {
  constructor(private readonly micrositiesService: MicrositiesService) {}

  @Post('assign-users/:id')
  @UsePipes(new ValidationPipe())
  async assignUsers(
    @Param('id') id: string,
    @Body() assignUserSitieDto: AssignUserMicrositieDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.micrositiesService.assignUsers(
        Number(id),
        assignUserSitieDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('remove-assign-users/:id')
  async removeAssignUser(
    @Param('id') id: string,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.micrositiesService.removeAssignUser(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createMicrosityDto: CreateMicrosityDto,
    @Req() req: Request,
  ): Promise<ServiceResponseI<MicrositieI>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.micrositiesService.create(createMicrosityDto, userId),
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(
    @Query() paginationResquestDto: PaginationResquestDto,
  ): Promise<ServiceResponseI<PaginationResponseI<MicrositieI[]>>> {
    return {
      message: await this.micrositiesService.findAll(paginationResquestDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ServiceResponseI<MicrositieI>> {
    return {
      message: await this.micrositiesService.findOne(Number(id), 'id'),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateMicrosityDto: UpdateMicrosityDto,
  ): Promise<ServiceResponseI<MicrositieI>> {
    return {
      message: await this.micrositiesService.update(
        Number(id),
        updateMicrosityDto,
      ),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.micrositiesService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
