import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InsightRecord } from '../shared/types';

const DB_PATH = path.resolve(__dirname, 'db.json');

@Injectable()
export class DbService {
  readAll(): InsightRecord[] {
    if (!fs.existsSync(DB_PATH)) {
      return [];
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as InsightRecord[];
  }

  write(records: InsightRecord[]): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(records, null, 2), 'utf-8');
  }
}
