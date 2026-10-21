import { Injectable } from '@nestjs/common';
import { OK_200 } from 'cms-lib-resources';
import { NotifyRepository } from '../repositories/notify.repository.js';
import { NotifyI } from '../dto/notify.dto.js';

@Injectable()
export class NotifyService {
  constructor(private readonly notifyRepository: NotifyRepository) {}

  async getNotifiesByUserId(userId: number) {
    return await this.notifyRepository.getAll(Number(userId));
  }

  async updateNotifyStatus(id: number) {
    await this.notifyRepository.update({
      id,
      readStatus: true,
    } as NotifyI);

    return OK_200;
  }
}
