import { Injectable, Logger } from '@nestjs/common';
import * as snowflake from 'snowflake-sdk';
import { InsightRecord } from '../shared/types';

const CORTEX_SQL =
  "SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-7b', 'SLA Over Average - Client Performance Degradation') AS RESULT";

@Injectable()
export class SnowflakeService {
  private readonly logger = new Logger(SnowflakeService.name);

  constructor() {}

  async runCortexQuery(): Promise<InsightRecord | null> {
    if (
      process.env.SNOWFLAKE_MOCK === 'true' &&
      process.env.NODE_ENV === 'production'
    ) {
      throw new Error('SNOWFLAKE_MOCK cannot be enabled in production');
    }

    if (process.env.SNOWFLAKE_MOCK === 'true') {
      this.logger.log('Mock mode — returning fake Cortex result');
      const today = new Date();
      return {
        id: crypto.randomUUID(),
        runDate: today.toISOString().slice(0, 10),
        query: CORTEX_SQL,
        result: {
          RESULT:
            'Mock insight: Sales increased 12% MoM. Top driver: new enterprise accounts in APAC region.',
        },
        savedAt: today.toISOString(),
      };
    }

    const requiredVars: Record<string, string | undefined> = {
      SNOWFLAKE_ACCOUNT: process.env.SNOWFLAKE_ACCOUNT,
      SNOWFLAKE_USER: process.env.SNOWFLAKE_USER,
      INTEGRATION_MSAL_ACCESS_TOKEN: process.env.INTEGRATION_MSAL_ACCESS_TOKEN,
    };
    const missing = Object.entries(requiredVars)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length > 0) {
      this.logger.error(`Missing required env vars: ${missing.join(', ')}`);
      return null;
    }

    try {
      const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT as string,
        username: process.env.SNOWFLAKE_USER,
        authenticator: 'oauth',
        token: process.env.INTEGRATION_MSAL_ACCESS_TOKEN,
        role: process.env.SNOWFLAKE_ROLE,
        ...(process.env.SNOWFLAKE_DATABASE
          ? { database: process.env.SNOWFLAKE_DATABASE }
          : {}),
        ...(process.env.SNOWFLAKE_WAREHOUSE
          ? { warehouse: process.env.SNOWFLAKE_WAREHOUSE }
          : {}),
        ...(process.env.SNOWFLAKE_SCHEMA
          ? { schema: process.env.SNOWFLAKE_SCHEMA }
          : {}),
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

      const rows = await new Promise<Record<string, unknown>[]>(
        (resolve, reject) => {
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
        },
      );

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

      this.logger.log(
        `Snowflake Cortex query result: ${JSON.stringify(record)}`,
      );

      return record;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : undefined;
      const sqlState =
        typeof err === 'object' && err !== null && 'sqlState' in err
          ? String((err as { sqlState: unknown }).sqlState)
          : undefined;
      this.logger.error(
        `Snowflake query failed — message: ${message} | code: ${code} | sqlState: ${sqlState}`,
      );
      return null;
    }
  }
}
