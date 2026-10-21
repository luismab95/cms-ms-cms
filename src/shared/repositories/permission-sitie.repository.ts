import { HttpException, HttpStatus } from '@nestjs/common';
import { errorQuery, ColumnsEnum } from 'cms-lib-resources';
import {
  Database,
  DataSource,
  EntityManager,
  Micrositie,
  PermissionSitie,
  Role,
  Sitie,
  User,
} from 'cms-lib-database';
import { PermissionSitieI } from '@shared/interfaces/permission-sitie.interface.js';

export class PermissionSitieRepository {
  async create(
    permissionSitie: PermissionSitieI,
    dataSource: EntityManager,
  ): Promise<PermissionSitieI> {
    try {
      const permissionSitieRepository =
        dataSource.getRepository(PermissionSitie);
      const newPermissionSitie = permissionSitieRepository.create(
        permissionSitie as PermissionSitie,
      );
      return await permissionSitieRepository.save(newPermissionSitie);
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    permissionSitie: PermissionSitieI,
    dataSource: EntityManager | DataSource | null,
  ): Promise<number> {
    try {
      if (dataSource === null) dataSource = Database.getConnection();
      const update = await dataSource
        .createQueryBuilder()
        .update(PermissionSitie)
        .set({ status: permissionSitie.status })
        .where('id = :id', { id: permissionSitie.id })
        .execute();
      return update.affected!;
    } catch (error) {
      const customMessage = errorQuery(error, ColumnsEnum);
      throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async find(
    permissionSitie: PermissionSitieI,
  ): Promise<PermissionSitieI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'ps.id as id',
        'ps.user_id as "userId"',
        'ps.sitie_id as "sitieId"',
        'ps.micrositie_id as "micrositieId"',
        'ps.status as "status"',
      ])
      .from(PermissionSitie, 'ps')
      .where('ps.user_id = :userId', { userId: permissionSitie.userId });

    if (permissionSitie.sitieId !== null) {
      query.andWhere('ps.sitie_id = :sitieId', {
        sitieId: permissionSitie.sitieId,
      });
    }

    if (permissionSitie.micrositieId !== null) {
      query.andWhere('ps.micrositie_id = :micrositieId', {
        micrositieId: permissionSitie.micrositieId,
      });
    }

    return await query.getRawOne<PermissionSitieI>();
  }

  async findId(id: number): Promise<PermissionSitieI | undefined> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'ps.id as id',
        'ps.user_id as "userId"',
        'ps.sitie_id as "sitieId"',
        'ps.micrositie_id as "micrositieId"',
        'ps.status as "status"',
        'u.firstname as "firstname"',
        'u.lastname as "lastname"',
        'u.email as "email"',
        'r.code as "role"',
        'r.name as "roleName"',
        's.name as "sitieName"',
        'ms.name as "micrositieName"',
      ])
      .from(PermissionSitie, 'ps')
      .innerJoin(User, 'u', 'u.id = ps.user_id')
      .innerJoin(Role, 'r', 'r.id = u.role_id')
      .leftJoin(Sitie, 's', 's.id = ps.sitie_id')
      .leftJoin(Micrositie, 'ms', 'ms.id = ps.micrositie_id')
      .where('ps.id = :id', { id });

    return await query.getRawOne<PermissionSitieI>();
  }

  async findByRole(
    roleId: number,
    sitieId: number,
    micrositieId: number | null,
  ): Promise<PermissionSitieI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'ps.id as id',
        'ps.user_id as "userId"',
        'ps.sitie_id as "sitieId"',
        'ps.micrositie_id as "micrositieId"',
        'ps.status as "status"',
        'u.firstname as "firstname"',
        'u.lastname as "lastname"',
        'u.email as "email"',
        'r.code as "role"',
        'r.name as "roleName"',
        's.name as "sitieName"',
        'ms.name as "micrositieName"',
      ])
      .from(PermissionSitie, 'ps')
      .innerJoin(User, 'u', 'u.id = ps.user_id')
      .innerJoin(Role, 'r', 'r.id = u.role_id');

    if (micrositieId !== null) {
      query.innerJoin(
        Micrositie,
        'ms',
        'ms.id = ps.micrositie_id and ms.id = :micrositieId',
        { micrositieId },
      );
    } else {
      query.innerJoin(Sitie, 's', 's.id = ps.sitie_id and s.id = :sitieId', {
        sitieId,
      });
    }

    query
      .where('r.id = :roleId', { roleId })
      .andWhere('ps.status = :status', { status: true });

    return await query.getRawMany<PermissionSitieI>();
  }

  async getAll(
    sitieId: number | null,
    micrositieId: number | null,
  ): Promise<PermissionSitieI[]> {
    const dataSource = Database.getConnection();
    const query = dataSource
      .createQueryBuilder()
      .select([
        'ps.id as id',
        'ps.user_id as "userId"',
        'ps.sitie_id as "sitieId"',
        'ps.micrositie_id as "micrositieId"',
        'ps.status as "status"',
        'u.firstname as "firstname"',
        'u.lastname as "lastname"',
        'u.email as "email"',
        'r.code as "role"',
        'r.name as "roleName"',
      ])
      .from(PermissionSitie, 'ps')
      .innerJoin(User, 'u', 'u.id = ps.user_id')
      .innerJoin(Role, 'r', 'r.id = u.role_id')
      .where('ps.status = :status', { status: true });

    if (sitieId !== null) {
      query.andWhere('ps.sitie_id = :sitieId', { sitieId });
    }

    if (micrositieId !== null) {
      query.andWhere('ps.micrositie_id = :micrositieId', { micrositieId });
    }

    return await query.getRawMany<PermissionSitieI>();
  }
}
