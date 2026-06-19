import { Module } from '@nestjs/common';
import { DbModule } from '../database/db.module';
import { SnowflakeModule } from '../snowflake/snowflake.module';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightsRepository } from './insights.repository';

@Module({
  imports: [DbModule, SnowflakeModule],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsRepository],
  exports: [InsightsService],
})
export class InsightsModule {}
