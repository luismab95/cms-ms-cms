import { Injectable } from '@nestjs/common';
import {
  DashboardElementsI,
  Top10PagesI,
  WeekVisitI,
  YearVisitI,
} from './dto/dashboard.dto';
import { DashboardRepository } from './repositories/dashboard.repository';
import * as lodash from 'lodash';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async countElements(): Promise<DashboardElementsI> {
    return await this.dashboardRepository.countElements();
  }

  async top10Pages(): Promise<Top10PagesI[]> {
    return await this.dashboardRepository.getTop10();
  }

  async weekVisits(): Promise<WeekVisitI> {
    const thisWeekVisit = await this.dashboardRepository.countWeekVisits(false);
    const thisWeek: number[] = [0, 0, 0, 0, 0, 0, 0];
    const groupedThisWeekVisit = lodash.groupBy(
      thisWeekVisit,
      'data.createdAt',
    );
    const groupedPageVisitThisWeek = lodash.groupBy(
      thisWeekVisit,
      'data.pageId',
    );
    const pageVisitThisWeek = Object.keys(groupedPageVisitThisWeek).length;
    const groupedMicrositieVisitThisWeek = lodash.groupBy(
      thisWeekVisit,
      'data.micrositie',
    );
    const micrositieVisitThisWeek = Object.keys(
      groupedMicrositieVisitThisWeek,
    ).filter((key) => key !== 'null').length;

    Object.keys(groupedThisWeekVisit).forEach((key) => {
      const weekDayNumber = new Date(key).getDay();
      thisWeek[weekDayNumber] = groupedThisWeekVisit[key].length;
    });

    const lastWeekVisit = await this.dashboardRepository.countWeekVisits(true);
    const lastWeek: number[] = [0, 0, 0, 0, 0, 0, 0];
    const groupedLastWeekVisit = lodash.groupBy(
      lastWeekVisit,
      'data.createdAt',
    );
    const groupedPageVisitLastWeek = lodash.groupBy(
      lastWeekVisit,
      'data.pageId',
    );
    const pageVisitLastWeek = Object.keys(groupedPageVisitLastWeek).length;
    const groupedMicrositieVisitLastWeek = lodash.groupBy(
      lastWeekVisit,
      'data.micrositie',
    );
    const micrositieVisitLastWeek = Object.keys(
      groupedMicrositieVisitLastWeek,
    ).filter((key) => key !== 'null').length;
    Object.keys(groupedLastWeekVisit).forEach((key) => {
      const weekDayNumber = new Date(key).getDay();
      lastWeek[weekDayNumber] = groupedLastWeekVisit[key].length;
    });

    return {
      lastWeek: {
        sitie: lastWeekVisit.length,
        page: pageVisitLastWeek,
        micrositie: micrositieVisitLastWeek,
        data: lastWeek,
      },
      thisWeek: {
        sitie: thisWeekVisit.length,
        page: pageVisitThisWeek,
        micrositie: micrositieVisitThisWeek,
        data: thisWeek,
      },
    };
  }

  async yearVisits(): Promise<YearVisitI> {
    const thisYearVisit = await this.dashboardRepository.countYearVisits(false);
    const groupedYearVisitThisWeek = lodash.groupBy(
      thisYearVisit,
      'data.createdAt',
    );

    const lastYearVisit = await this.dashboardRepository.countYearVisits(true);
    const groupedYearVisitLastYear = lodash.groupBy(
      lastYearVisit,
      'data.createdAt',
    );

    return {
      lastYear: [
        {
          name: 'Visitas',
          data: Object.keys(groupedYearVisitLastYear).map((key) => ({
            x: key,
            y: groupedYearVisitThisWeek[key].length,
          })),
        },
      ],
      thisYear: [
        {
          name: 'Visitas',
          data: Object.keys(groupedYearVisitThisWeek).map((key) => ({
            x: key,
            y: groupedYearVisitThisWeek[key].length,
          })),
        },
      ],
    };
  }

  async visitVsPageVisits(): Promise<YearVisitI> {
    const thisYearVisit = await this.dashboardRepository.countYearVisits(false);
    const groupedYearVisitThisWeek = lodash.groupBy(
      thisYearVisit,
      'data.createdAt',
    );

    const lastYearVisit = await this.dashboardRepository.countYearVisits(true);
    const groupedYearVisitLastYear = lodash.groupBy(
      lastYearVisit,
      'data.createdAt',
    );

    const groupedPageVisitThisYear = lodash.groupBy(
      thisYearVisit,
      'data.pageId',
    );
    const groupedPageVisitLastYear = lodash.groupBy(
      lastYearVisit,
      'data.pageId',
    );

    return {
      lastYear: [
        {
          name: 'Visitas',
          data: Object.keys(groupedYearVisitLastYear).map((key) => ({
            x: key,
            y: groupedYearVisitLastYear[key].length,
          })),
        },
        {
          name: 'Páginas vistas',
          data: Object.keys(groupedYearVisitLastYear).map((key) => {
            const groupedPage = lodash.groupBy(
              groupedYearVisitLastYear[key],
              'data.pageId',
            );
            return {
              x: key,
              y: Object.keys(groupedPage).length,
            };
          }),
        },
      ],
      thisYear: [
        {
          name: 'Visitas',
          data: Object.keys(groupedYearVisitThisWeek).map((key) => ({
            x: key,
            y: groupedYearVisitThisWeek[key].length,
          })),
        },
        {
          name: 'Páginas vistas',
          data: Object.keys(groupedYearVisitThisWeek).map((key) => {
            const groupedPage = lodash.groupBy(
              groupedYearVisitThisWeek[key],
              'data.pageId',
            );
            return {
              x: key,
              y: Object.keys(groupedPage).length,
            };
          }),
        },
      ],
    };
  }
}
