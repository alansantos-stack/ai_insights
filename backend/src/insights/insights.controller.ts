import { Controller, Get, Post } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { SnowflakeService } from '../snowflake/snowflake.service';
import { InsightRecord } from '../shared/types';

@Controller('insights')
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly snowflakeService: SnowflakeService,
  ) {}

  @Get()
  findAll(): InsightRecord[] {
    return this.insightsService.findAll();
  }

  @Post('trigger')
  async trigger(): Promise<{ triggered: boolean; saved: boolean }> {
    const result = await this.snowflakeService.runCortexQuery();

    if (result !== null) {
      this.insightsService.save(result);
      return { triggered: true, saved: true };
    }

    return { triggered: true, saved: false };
  }
}
