import { Module } from '@nestjs/common';
import { InsightsModule } from './insights/insights.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [InsightsModule, SchedulerModule],
})
export class AppModule {}
