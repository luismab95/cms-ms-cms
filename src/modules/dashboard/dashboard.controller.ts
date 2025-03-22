import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { DashboardService } from './dashboard.service';
import { ServiceResponseInterface } from 'src/shared/interfaces/response.interface';
import {
  DashboardElementsI,
  Top10PagesI,
  WeekVisitI,
  YearVisitI,
} from './dto/dashboard.dto';

@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('count-elements')
  async countElements(): Promise<ServiceResponseInterface<DashboardElementsI>> {
    return {
      message: await this.dashboardService.countElements(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('top-10-pages')
  async top10Pages(): Promise<ServiceResponseInterface<Top10PagesI[]>> {
    return {
      message: await this.dashboardService.top10Pages(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('week-visits')
  async weekVisits(): Promise<ServiceResponseInterface<WeekVisitI>> {
    return {
      message: await this.dashboardService.weekVisits(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('year-visits')
  async yearVisits(): Promise<ServiceResponseInterface<YearVisitI>> {
    return {
      message: await this.dashboardService.yearVisits(),
      statusCode: HttpStatus.OK,
    };
  }

  @Get('visits-vs-pages')
  async visitVsPageVisits(): Promise<ServiceResponseInterface<YearVisitI>> {
    return {
      message: await this.dashboardService.visitVsPageVisits(),
      statusCode: HttpStatus.OK,
    };
  }
}
