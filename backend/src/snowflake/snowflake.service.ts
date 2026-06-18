import { Injectable, Logger } from '@nestjs/common';
import * as snowflake from 'snowflake-sdk';
import { InsightRecord } from '../shared/types';

const CORTEX_SQL =
  "SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-7b', 'Summarize key trends from last month data.') AS RESULT";

@Injectable()
export class SnowflakeService {
  private readonly logger = new Logger(SnowflakeService.name);

  async runCortexQuery(): Promise<InsightRecord | null> {
    if (process.env.SNOWFLAKE_MOCK === 'true') {
      this.logger.log('Mock mode — returning fake Cortex result');
      const today = new Date();
      return {
        id: crypto.randomUUID(),
        runDate: today.toISOString().slice(0, 10),
        query: CORTEX_SQL,
        result: { RESULT: 'Mock insight: Sales increased 12% MoM. Top driver: new enterprise accounts in APAC region.' },
        savedAt: today.toISOString(),
      };
    }

    try {
      const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT as string,
        username: process.env.SNOWFLAKE_USER as string,
        password: process.env.SNOWFLAKE_PASSWORD as string,
        database: process.env.SNOWFLAKE_DATABASE as string,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE as string,
        schema: process.env.SNOWFLAKE_SCHEMA as string,
      });
      await new Promise<void>((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      const rows = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        connection.execute({
          sqlText: CORTEX_SQL,
          complete: (err, _stmt, rowsResult) => {
            if (err) {
              reject(err);
            } else {
              resolve((rowsResult as Record<string, unknown>[]) ?? []);
            }
          },
        });
      });

      if (!rows || rows.length === 0) {
        return null;
      }

      const today = new Date();
      const runDate = today.toISOString().slice(0, 10);

      const record: InsightRecord = {
        id: crypto.randomUUID(),
        runDate,
        query: CORTEX_SQL,
        result: rows[0],
        savedAt: today.toISOString(),
      };

      return record;
    } catch (err) {
      this.logger.error('Snowflake Cortex query failed', err);
      return null;
    }
  }
}
