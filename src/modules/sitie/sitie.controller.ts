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
} from '@nestjs/common';
import { SitieService } from './sitie.service';
import { SitieI, UpdateSitieDto } from './dto/sitie.dto';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('sitie')
@UseGuards(JwtGuard)
export class SitieController {
  constructor(private readonly sitieService: SitieService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findOne(): Promise<ServiceResponseInterface<SitieI>> {
    return {
      message: await this.sitieService.findOne(),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateSitieDto: UpdateSitieDto,
  ): Promise<ServiceResponseInterface<SitieI>> {
    return {
      message: await this.sitieService.update(Number(id), updateSitieDto),
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.sitieService.remove(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
