import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Req,
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
  async findAll(@Req() req: Request): Promise<ServiceResponseI<NotifyI[]>> {
    const userId = (req as Request & { userId: number }).userId;
    return {
      message: await this.notifyService.getNotifiesByUserId(userId),
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
