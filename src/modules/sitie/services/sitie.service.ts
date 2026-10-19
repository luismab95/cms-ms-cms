import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Database } from 'cms-lib-database';
import { EmailI, OK_200, getParameter, sendMail } from 'cms-lib-resources';
import { PermissionSitieI } from '@shared/interfaces/permission-sitie.interface.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { SitieRepository } from '../repositories/sitie.repository.js';
import { AssignUserSitieDto, UpdateSitieDto } from '../dto/sitie.dto.js';

@Injectable()
export class SitieService {
  constructor(
    private readonly sitieRepository: SitieRepository,
    private readonly permissionSitieRepository: PermissionSitieRepository,
    private readonly parameterRepository: ParameterRepository,
  ) {}

  async findOne() {
    const sitie = await this.sitieRepository.find();
    if (sitie === undefined) {
      throw new HttpException(
        'No se encontro datos del sitio',
        HttpStatus.BAD_REQUEST,
      );
    }

    const permissionSitie = await this.permissionSitieRepository.getAll(
      sitie.id!,
      null,
    );
    return { ...sitie, permissionSitie };
  }

  async update(id: number, updateSitieDto: UpdateSitieDto) {
    await this.findOne();
    await this.sitieRepository.update(id, updateSitieDto);
    return await this.findOne();
  }

  async remove(id: number) {
    const sitie = await this.findOne();
    sitie.status = !sitie.status;
    await this.sitieRepository.update(id, sitie as unknown as UpdateSitieDto);
    return OK_200;
  }

  async assignUsers(sitieId: number, params: AssignUserSitieDto) {
    const permissionId: number[] = [];
    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      for (let user of params.users) {
        const newPermission = {
          sitieId,
          userId: user,
          status: true,
          micrositieId: null,
        } as PermissionSitieI;
        const findUserPermission =
          await this.permissionSitieRepository.find(newPermission);
        if (findUserPermission) {
          newPermission.id = findUserPermission.id;
          permissionId.push(newPermission.id);
          await this.permissionSitieRepository.update(newPermission, cnx);
        } else {
          const inserted = await this.permissionSitieRepository.create(
            newPermission,
            cnx,
          );
          permissionId.push(inserted.id);
        }
      }
    });

    for (let permission of permissionId) {
      const findPermission =
        await this.permissionSitieRepository.findId(permission);
      if (findPermission === undefined) {
        throw new HttpException(
          'No se encontro datos del permiso',
          HttpStatus.BAD_REQUEST,
        );
      }

      const parameters = await this.parameterRepository.getParameters();

      const URlStatics = await getParameter(
        parameters.find((p) => p.code === 'APP_STATICS_URL'),
        'APP_STATICS_URL',
      );
      const logoMail = await getParameter(
        parameters.find((p) => p.code === 'LOGO_MAIL'),
        'LOGO_MAIL',
      );
      const emailData = {
        templateName: 'assign-user',
        subject: 'Asignación al Sitio',
        to: findPermission.email,
        context: {
          fullName: `${findPermission.firstname} ${findPermission.lastname}`,
          companyName: await getParameter(
            parameters.find((p) => p.code === 'COMPANY_NAME'),
            'COMPANY_NAME',
          ),
          mailFooter: await getParameter(
            parameters.find((p) => p.code === 'COMPANY_MAIL'),
            'COMPANY_MAIL',
          ),
          imageHeader: `${URlStatics}/${logoMail}`,
          year: new Date().getFullYear(),
          entityName: findPermission.sitieName,
          type: 'site',
          action: 'assign',
        },
      } as EmailI;
      sendMail(emailData);
    }

    return OK_200;
  }

  async removeAssignUser(permissionId: number) {
    const updatePermission = {
      id: permissionId,
      status: false,
    } as PermissionSitieI;
    const findPermission =
      await this.permissionSitieRepository.findId(permissionId);
    if (findPermission === undefined) {
      throw new HttpException(
        'No se encontro datos del permiso',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.permissionSitieRepository.update(updatePermission, null);

    const parameters = await this.parameterRepository.getParameters();

    const URlStatics = await getParameter(
      parameters.find((p) => p.code === 'APP_STATICS_URL'),
      'APP_STATICS_URL',
    );
    const logoMail = await getParameter(
      parameters.find((p) => p.code === 'LOGO_MAIL'),
      'LOGO_MAIL',
    );
    const emailData = {
      templateName: 'assign-user',
      subject: 'Desasignación del Sitio',
      to: findPermission.email,
      context: {
        fullName: `${findPermission.firstname} ${findPermission.lastname}`,
        companyName: await getParameter(
          parameters.find((p) => p.code === 'COMPANY_NAME'),
          'COMPANY_NAME',
        ),
        mailFooter: await getParameter(
          parameters.find((p) => p.code === 'COMPANY_MAIL'),
          'COMPANY_MAIL',
        ),
        imageHeader: `${URlStatics}/${logoMail}`,
        year: new Date().getFullYear(),
        entityName: findPermission.sitieName,
        type: 'site',
        action: 'remove',
      },
    } as EmailI;
    sendMail(emailData);

    return OK_200;
  }
}
