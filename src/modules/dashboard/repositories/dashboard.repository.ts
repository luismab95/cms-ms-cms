import {
  Database,
  Page,
  Micrositie,
  Template,
  InjectModel,
  Model,
  File as FileEntity,
} from 'cms-lib-database';
import moment from 'moment';
import {
  DashboardElementsI,
  Top10PagesI,
  VisitMongoI,
} from '../dto/dashboard.dto.js';

export class DashboardRepository {
  constructor(
    @InjectModel('Visit')
    private readonly visitModel: Model<VisitMongoI>,
  ) {}

  async countElements(): Promise<DashboardElementsI> {
    const dataSource = Database.getConnection();

    const pageRepository = dataSource.getRepository(Page);
    const micrositieRepository = dataSource.getRepository(Micrositie);
    const filesRepository = dataSource.getRepository(FileEntity);
    const templatesRepository = dataSource.getRepository(Template);

    const pages = await pageRepository
      .createQueryBuilder('page')
      .where('page.status = true')
      .getCount();

    const templates = await templatesRepository
      .createQueryBuilder('template')
      .where('template.status = true')
      .getCount();

    const microsities = await micrositieRepository
      .createQueryBuilder('micrositie')
      .where('micrositie.status = true')
      .getCount();

    const files = await filesRepository
      .createQueryBuilder('file')
      .where('file.status = true')
      .getCount();

    return { pages, microsities, templates, files };
  }

  async countWeekVisits(lastWeek: boolean): Promise<VisitMongoI[]> {
    let from: string = moment().startOf('isoWeek').format('YYYY-MM-DD');
    let to: string = moment().endOf('isoWeek').format('YYYY-MM-DD');

    if (lastWeek) {
      from = moment()
        .subtract(1, 'weeks')
        .startOf('isoWeek')
        .format('YYYY-MM-DD');
      to = moment().subtract(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DD');
    }

    const visits = await this.visitModel
      .find({
        'data.createdAt': {
          $gte: from,
          $lte: to,
        },
      })
      .exec();

    return visits;
  }

  async countYearVisits(lastyear: boolean): Promise<VisitMongoI[]> {
    let from: string = moment().startOf('year').format('YYYY-MM-DD');
    let to: string = moment().endOf('year').format('YYYY-MM-DD');

    if (lastyear) {
      from = moment().subtract(1, 'years').startOf('year').format('YYYY-MM-DD');
      to = moment().subtract(1, 'years').endOf('year').format('YYYY-MM-DD');
    }

    const visits = await this.visitModel
      .find({
        'data.createdAt': {
          $gte: from,
          $lte: to,
        },
      })
      .exec();

    return visits;
  }

  async countVisits(): Promise<VisitMongoI[]> {
    const visits = await this.visitModel.find().exec();

    return visits;
  }

  async getTop10(): Promise<Top10PagesI[]> {
    const visits = await this.visitModel
      .aggregate([
        {
          $group: {
            _id: { pageId: '$data.pageId', lang: '$data.lang' },
            visits: { $sum: 1 },
            pageId: { $first: '$data.pageId' },
            micrositieId: { $first: '$data.micrositieId' },
            lang: { $first: '$data.lang' },
            path: { $first: '$data.path' },
            micrositie: { $first: '$data.micrositie' },
            name: { $first: '$data.name' },
          },
        },
        {
          $sort: { visits: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .exec();

    return visits;
  }
}
