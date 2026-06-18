export interface InsightRecord {
  id: string;
  runDate: string; // YYYY-MM-DD
  query: string;
  result: unknown;
  savedAt: string; // ISO timestamp
}
