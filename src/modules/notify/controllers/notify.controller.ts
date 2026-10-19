import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtGuard, ServiceResponseI } from 'cms-lib-resources';
import { NotifyI } from '../dto/notify.dto.js';
import { NotifyService } from '../services/notify.service.js';

@Controller('notify')
@UseGuards(JwtGuard)
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(): Promise<ServiceResponseI<NotifyI[]>> {
    return {
      message: await this.notifyService.getNotifiesByRoleId(),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async rejectReviewPage(
    @Param('id') id: string,
  ): Promise<ServiceResponseI<string>> {
    return {
      message: await this.notifyService.updateNotifyStatus(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
