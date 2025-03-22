import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitSchema } from './schemas/visit.schema';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Visit', schema: VisitSchema }]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
