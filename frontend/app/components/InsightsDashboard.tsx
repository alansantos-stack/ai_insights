'use client';

import { useState, useCallback } from 'react';
import { getInsights, getTopClients } from '@/app/lib/api';
import type { InsightRecord, ClientSlaRow } from '@/app/lib/api';
import InsightList from './InsightList';
import TriggerButton from './TriggerButton';
import ClientSlaModal from './ClientSlaModal';

interface InsightsDashboardProps {
  initialInsights: InsightRecord[];
}

export default function InsightsDashboard({
  initialInsights,
}: InsightsDashboardProps) {
  const [insights, setInsights] = useState<InsightRecord[]>(initialInsights);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientData, setClientData] = useState<ClientSlaRow[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const fresh = await getInsights();
      setInsights(fresh);
    } catch {
      // Silently ignore — the existing list remains visible
    }
  }, []);

  const openModal = useCallback(async () => {
    setModalOpen(true);
    setClientLoading(true);
    setClientError(null);
    try {
      const clients = await getTopClients();
      setClientData(clients);
    } catch (err) {
      setClientError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setClientLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="flex flex-col gap-6">
      <TriggerButton onSuccess={refetch} />
      <InsightList insights={insights} onCardClick={openModal} />
      <ClientSlaModal
        isOpen={modalOpen}
        onClose={closeModal}
        clients={clientData}
        isLoading={clientLoading}
        error={clientError}
      />
    </div>
  );
}
