export interface InsightRecord {
  id: string;
  runDate: string; // YYYY-MM-DD
  query: string;
  result: unknown;
  savedAt: string; // ISO timestamp
}

export interface ClientSlaRow {
  idClient: string;
  avgSlaLastMonth: number;
  historicalAvgSla: number;
  overOwnAvg: number;
}
