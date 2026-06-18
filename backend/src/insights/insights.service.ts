import { Injectable } from '@nestjs/common';
import { InsightsRepository } from './insights.repository';
import { InsightRecord } from '../shared/types';

@Injectable()
export class InsightsService {
  constructor(private readonly repo: InsightsRepository) {}

  findAll(): InsightRecord[] {
    return this.repo.findAll();
  }

  save(insight: InsightRecord): void {
    this.repo.save(insight);
  }
}
