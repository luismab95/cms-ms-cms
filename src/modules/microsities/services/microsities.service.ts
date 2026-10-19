import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel, Database, Model } from 'cms-lib-database';
import {
  stringToSlug,
  PaginationResquestDto,
  OK_200,
  getParameter,
  sendMail,
  EmailI,
} from 'cms-lib-resources';
import {
  AssignUserMicrositieDto,
  CreateMicrosityDto,
  UpdateMicrosityDto,
} from '../dto/microsity.dto.js';
import { PageMongoI, CreatePageDto } from '@modules/pages/dto/page.dto.js';
import { createPage } from '@shared/helpers/page.helper.js';
import { PermissionSitieI } from '@shared/interfaces/permission-sitie.interface.js';
import { PermissionSitieRepository } from '@shared/repositories/permission-sitie.repository.js';
import { ParameterRepository } from '@shared/repositories/parameter.repository.js';
import { MicrosityRepository } from '../repositories/microsities.repository.js';

@Injectable()
export class MicrositiesService {
  constructor(
    private readonly microsityRepository: MicrosityRepository,
    private readonly parameterRepository: ParameterRepository,
    private readonly permissionSitieRepository: PermissionSitieRepository,
    @InjectModel('Page')
    private readonly pageModel: Model<PageMongoI>,
  ) {}

  async create(createMicrosityDto: CreateMicrosityDto, userId: number) {
    createMicrosityDto.path = stringToSlug(createMicrosityDto.name);

    const dataSource = Database.getConnection();
    return dataSource.transaction(async (cnx) => {
      const newMicrositie = await this.microsityRepository.create(
        createMicrosityDto,
        cnx,
      );

      const assignUser = {
        micrositieId: newMicrositie.id,
        status: true,
        userId,
        sitieId: null,
      } as PermissionSitieI;
      await this.permissionSitieRepository.create(assignUser, cnx);

      const createdPage = new this.pageModel({
        data: {
          body: {
            css: '.body{\n display: block;\n  width: 100%;\n  height: auto;\n  min-height: 600px;\n  padding-top: 10px;\n  padding-right: 10px;\n  padding-bottom: 10px;\n  padding-left: 10px;\n}',
            config: {
              backgroundImage: '',
            },
            data: [],
          },
        },
      });
      const pageData = await createdPage.save();
      const createPageDto = {
        mongoId: String(pageData._id),
        micrositieId: newMicrositie.id,
        isHomePage: true,
        path: 'inicio',
        name: createMicrosityDto.name,
      } as CreatePageDto;
      await createPage(createPageDto, cnx);

      return newMicrositie;
    });
  }

  async findAll(paginationResquestDto: PaginationResquestDto) {
    return await this.microsityRepository.get(paginationResquestDto);
  }

  async findOne(value: any, code: string) {
    const micrositie = await this.microsityRepository.find(code, value);
    if (micrositie === undefined) {
      throw new HttpException(
        'No se encontro datos del micrositio',
        HttpStatus.BAD_REQUEST,
      );
    }

    micrositie.path = `${micrositie.path}/${micrositie.pathPage}`;
    const permissionMicrositie = await this.permissionSitieRepository.getAll(
      null,
      micrositie.id!,
    );
    return { ...micrositie, permissionMicrositie };
  }

  async update(id: number, updateMicrosityDto: UpdateMicrosityDto) {
    await this.microsityRepository.update(id, updateMicrosityDto);
    return await this.findOne(id, 'id');
  }

  async remove(id: number) {
    const micrositie = await this.findOne(id, 'id');
    micrositie.status = !micrositie.status;
    await this.microsityRepository.update(
      id,
      micrositie as unknown as UpdateMicrosityDto,
    );
    return OK_200;
  }

  async assignUsers(micrositieId: number, params: AssignUserMicrositieDto) {
    const permissionId: number[] = [];
    const dataSource = Database.getConnection();
    await dataSource.transaction(async (cnx) => {
      for (let user of params.users) {
        const newPermission = {
          micrositieId,
          userId: user,
          status: true,
          sitieId: null,
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
        subject: 'Asignación al Micrositio',
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
          entityName: findPermission.micrositieName,
          type: 'micrositie',
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

    const parameters = await this.parameterRepository.getParameters();

    await this.permissionSitieRepository.update(updatePermission, null);
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
      subject: 'Desasignación del Micrositio',
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
        entityName: findPermission.micrositieName,
        type: 'micrositie',
        action: 'remove',
      },
    } as EmailI;
    sendMail(emailData);

    return OK_200;
  }
}
