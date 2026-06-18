import { Injectable } from '@nestjs/common';
import { DbService } from '../database/db.service';
import { InsightRecord } from '../shared/types';

@Injectable()
export class InsightsRepository {
  constructor(private readonly dbService: DbService) {}

  findAll(): InsightRecord[] {
    return this.dbService.readAll();
  }

  save(insight: InsightRecord): void {
    const records = this.dbService.readAll();
    records.push(insight);
    this.dbService.write(records);
  }
}
