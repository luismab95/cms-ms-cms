import { Module } from '@nestjs/common';
import { MongooseModule, VisitSchema } from 'cms-lib-database';
import { DashboardController } from './controllers/dashboard.controller.js';
import { DashboardService } from './services/dashboard.service.js';
import { DashboardRepository } from './repositories/dashboard.repository.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Visit', schema: VisitSchema }]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
