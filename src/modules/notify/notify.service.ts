import { Inject, Injectable } from '@nestjs/common';
import { NotifyRepository } from './repositories/notify.repository';
import { NotifyI } from './dto/notify.dto';
import { OK_200 } from 'src/shared/constants/message.constants';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class NotifyService {
  constructor(
    private readonly notifyRepository: NotifyRepository,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async getNotifiesByRoleId() {
    const roleId = this.request['roleId'];
    return await this.notifyRepository.getAll(Number(roleId));
  }

  async updateNotifyStatus(id: number) {
    await this.notifyRepository.update({
      id,
      readStatus: true,
    } as NotifyI);

    return OK_200;
  }
}
