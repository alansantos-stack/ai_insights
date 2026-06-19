import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SnowflakeModule } from '../snowflake/snowflake.module';
import { InsightsModule } from '../insights/insights.module';
import { InsightsScheduler } from './insights.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), SnowflakeModule, InsightsModule],
  providers: [InsightsScheduler],
})
export class SchedulerModule {}
