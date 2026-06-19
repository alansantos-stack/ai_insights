const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface InsightRecord {
  id: string;
  runDate: string;   // YYYY-MM-DD
  query: string;
  result: unknown;
  savedAt: string;   // ISO timestamp
}

export async function getInsights(): Promise<InsightRecord[]> {
  try {
    const res = await fetch(`${BASE}/insights`, {
      // No caching — always fetch fresh data on each request
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch insights: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch {
    // Backend may be down; return empty array so the page still renders
    return [];
  }
}

export async function triggerInsights(): Promise<{ triggered: boolean }> {
  const res = await fetch(`${BASE}/insights/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Trigger failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface ClientSlaRow {
  idClient: string;
  avgSlaLastMonth: number;
  historicalAvgSla: number;
  overOwnAvg: number;
}

export async function getTopClients(): Promise<ClientSlaRow[]> {
  const res = await fetch(`${BASE}/insights/top-clients`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch top clients: ${res.status}`);
  }
  const data = await res.json();
  return data.clients;
}
