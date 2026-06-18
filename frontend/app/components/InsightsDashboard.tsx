'use client';

import { useState, useCallback } from 'react';
import { getInsights } from '@/app/lib/api';
import type { InsightRecord } from '@/app/lib/api';
import InsightList from './InsightList';
import TriggerButton from './TriggerButton';

interface InsightsDashboardProps {
  initialInsights: InsightRecord[];
}

export default function InsightsDashboard({
  initialInsights,
}: InsightsDashboardProps) {
  const [insights, setInsights] = useState<InsightRecord[]>(initialInsights);

  const refetch = useCallback(async () => {
    try {
      const fresh = await getInsights();
      setInsights(fresh);
    } catch {
      // Silently ignore — the existing list remains visible
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <TriggerButton onSuccess={refetch} />
      <InsightList insights={insights} />
    </div>
  );
}
