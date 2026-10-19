import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { OK_200 } from 'cms-lib-resources';
import { NotifyRepository } from '../repositories/notify.repository.js';
import { NotifyI } from '../dto/notify.dto.js';

@Injectable()
export class NotifyService {
  constructor(
    private readonly notifyRepository: NotifyRepository,
    @Inject(REQUEST) private readonly request: Request & { roleId: number },
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
