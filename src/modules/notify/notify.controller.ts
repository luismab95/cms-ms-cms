import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import { NotifyI } from './dto/notify.dto';
import { NotifyService } from './notify.service';

@Controller('notify')
@UseGuards(JwtGuard)
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Get()
  @UsePipes(new ValidationPipe())
  async findAll(): Promise<ServiceResponseInterface<NotifyI[]>> {
    return {
      message: await this.notifyService.getNotifiesByRoleId(),
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async rejectReviewPage(
    @Param('id') id: string,
  ): Promise<ServiceResponseInterface<string>> {
    return {
      message: await this.notifyService.updateNotifyStatus(Number(id)),
      statusCode: HttpStatus.OK,
    };
  }
}
