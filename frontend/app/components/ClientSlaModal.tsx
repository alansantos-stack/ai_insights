'use client';

import { useEffect } from 'react';
import { ClientSlaRow } from '../lib/api';

interface ClientSlaModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientSlaRow[];
  isLoading: boolean;
  error: string | null;
}

export default function ClientSlaModal({
  isOpen,
  onClose,
  clients,
  isLoading,
  error,
}: ClientSlaModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-[var(--color-text-heading)]">
            Top Clients — SLA Performance
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-heading)]"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {['IDCLIENT', 'Avg SLA Last Month', 'Historical Avg SLA', 'Over Own Avg (days)'].map(
                  (col) => (
                    <th
                      key={col}
                      className="bg-[var(--color-surface-subtle)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-text-muted)]">
                    Loading…
                  </td>
                </tr>
              )}
              {error && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[var(--color-danger-cell)]">
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                clients.map((row) => (
                  <tr key={row.idClient}>
                    <td className="border-t border-[var(--color-border-inner)] px-4 py-3 font-mono text-[var(--color-text-mono)]">
                      {row.idClient}
                    </td>
                    <td className="border-t border-[var(--color-border-inner)] px-4 py-3 text-[var(--color-text-body)]">
                      {row.avgSlaLastMonth.toFixed(2)}
                    </td>
                    <td className="border-t border-[var(--color-border-inner)] px-4 py-3 text-[var(--color-text-body)]">
                      {row.historicalAvgSla.toFixed(2)}
                    </td>
                    <td
                      className={`border-t border-[var(--color-border-inner)] px-4 py-3 font-medium ${
                        row.overOwnAvg > 0 ? 'text-[var(--color-danger-cell)]' : 'text-[var(--color-success-cell)]'
                      }`}
                    >
                      {row.overOwnAvg > 0 ? '+' : ''}
                      {row.overOwnAvg.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
