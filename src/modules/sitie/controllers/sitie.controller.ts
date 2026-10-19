import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Post,
} from '@nestjs/common';
import { JwtGuard, ServiceResponseI } from 'cms-lib-resources';
import { SitieService } from '../services/sitie.service.js';
import {
  AssignUserSitieDto,
  SitieI,
  UpdateSitieDto,
} from '../dto/sitie.dto.js';

@Controller('sitie')
@UseGuards(JwtGuard)
export class SitieController {
  constructor(private readonly sitieService: SitieService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findOne(): Promise<ServiceResponseI<SitieI>> {
    return {
      message: await this.sitieService.findOne(),
      statusCode: HttpStatus.OK,
    };
  }

  @Post('assign-users/:id')
  @UsePipes(new ValidationPipe())
  async assignUsers(
    @Param('id') id: string,
    @Body() assignUserSitieDto: AssignUserSitieDto,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.sitieService.assignUsers(
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
      message: await this.sitieService.removeAssignUser(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateSitieDto: UpdateSitieDto,
  ): Promise<ServiceResponseI<SitieI>> {
    return {
      message: await this.sitieService.update(Number(id), updateSitieDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ServiceResponseI<string>> {
    return {
      message: await this.sitieService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
