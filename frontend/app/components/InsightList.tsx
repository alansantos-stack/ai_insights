import type { InsightRecord } from '@/app/lib/api';
import InsightCard from './InsightCard';

interface InsightListProps {
  insights: InsightRecord[];
}

export default function InsightList({ insights }: InsightListProps) {
  if (insights.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-500 text-base">
          No insights yet. The next run is on the 1st of next month.
        </p>
      </div>
    );
  }

  // Sort newest first by savedAt
  const sorted = [...insights].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <section aria-label="Insights list">
      <ul className="flex flex-col gap-4" role="list">
        {sorted.map((insight) => (
          <li key={insight.id}>
            <InsightCard insight={insight} />
          </li>
        ))}
      </ul>
    </section>
  );
}
