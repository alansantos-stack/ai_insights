import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SnowflakeService } from '../snowflake/snowflake.service';
import { InsightsService } from '../insights/insights.service';

@Injectable()
export class InsightsScheduler {
  private readonly logger = new Logger(InsightsScheduler.name);

  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly insightsService: InsightsService,
  ) {}

  @Cron('0 0 1 * *')
  async runMonthlyInsights(): Promise<void> {
    this.logger.log('Starting monthly Cortex insights job...');

    const result = await this.snowflakeService.runCortexQuery();

    if (result !== null) {
      this.insightsService.save(result);
      this.logger.log('Insight saved.');
    } else {
      this.logger.log('No result from Cortex — skipping save.');
    }
  }
}
