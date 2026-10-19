import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtGuard, ServiceResponseI } from 'cms-lib-resources';
import {
  DashboardElementsI,
  Top10PagesI,
  VisitI,
  WeekVisitI,
  YearVisitI,
} from '../dto/dashboard.dto.js';
import { DashboardService } from '../services/dashboard.service.js';

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('count-elements')
  async countElements(): Promise<ServiceResponseI<DashboardElementsI>> {
    return {
      message: await this.dashboardService.countElements(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('top-10-pages')
  async top10Pages(): Promise<ServiceResponseI<Top10PagesI[]>> {
    return {
      message: await this.dashboardService.top10Pages(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('week-visits')
  async weekVisits(): Promise<ServiceResponseI<WeekVisitI>> {
    return {
      message: await this.dashboardService.weekVisits(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('year-visits')
  async yearVisits(): Promise<ServiceResponseI<YearVisitI>> {
    return {
      message: await this.dashboardService.yearVisits(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('visits')
  async visitVsPageVisits(): Promise<ServiceResponseI<VisitI>> {
    return {
      message: await this.dashboardService.visitVsPageVisits(),
      statusCode: HttpStatus.OK,
    };
  }
}
