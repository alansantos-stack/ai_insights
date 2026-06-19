'use client';

import { useState } from 'react';
import type { InsightRecord } from '@/app/lib/api';

interface InsightCardProps {
  insight: InsightRecord;
  onViewClients?: () => void;
}

function formatRunDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD; parse as local date to avoid UTC offset shifting the day
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatSavedAt(isoStr: string): string {
  return new Date(isoStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const QUERY_TRUNCATE_LENGTH = 120;

export default function InsightCard({ insight, onViewClients }: InsightCardProps) {
  const [queryExpanded, setQueryExpanded] = useState(false);

  const isQueryLong = insight.query.length > QUERY_TRUNCATE_LENGTH;
  const displayedQuery =
    isQueryLong && !queryExpanded
      ? `${insight.query.slice(0, QUERY_TRUNCATE_LENGTH)}…`
      : insight.query;

  const resultJson = JSON.stringify(insight.result, null, 2);

  return (
    <article
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm p-5 flex flex-col gap-3"
      aria-label={`Insight from ${formatRunDate(insight.runDate)}`}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-[var(--color-text-heading)]">
          {formatRunDate(insight.runDate)}
        </h2>
        <time
          dateTime={insight.savedAt}
          className="text-xs text-[var(--color-text-caption)]"
          title="Saved at"
        >
          Saved {formatSavedAt(insight.savedAt)}
        </time>
      </div>

      {/* Query */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
          Query
        </p>
        <p className="text-sm text-[var(--color-text-body)] leading-relaxed">
          {displayedQuery}
        </p>
        {isQueryLong && (
          <button
            type="button"
            onClick={() => setQueryExpanded((prev) => !prev)}
            className="mt-1 text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-active)] focus:outline-none focus-visible:underline"
            aria-expanded={queryExpanded}
          >
            {queryExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Result */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
          Result
        </p>
        <pre
          className="text-xs bg-[var(--color-surface-subtle)] border border-[var(--color-border-inner)] rounded-lg p-3 overflow-auto max-h-64 text-[var(--color-text-mono)] leading-relaxed"
          tabIndex={0}
          aria-label="Insight result JSON"
        >
          {resultJson}
        </pre>
      </div>

      {onViewClients && (
        <button
          type="button"
          onClick={onViewClients}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ring)]"
        >
          View Top Clients
        </button>
      )}
    </article>
  );
}
