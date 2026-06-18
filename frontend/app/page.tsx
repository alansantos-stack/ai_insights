import type { Metadata } from 'next';
import { getInsights } from '@/app/lib/api';
import InsightsDashboard from '@/app/components/InsightsDashboard';

export const metadata: Metadata = {
  title: 'AI Insights Dashboard',
  description: 'View and trigger AI-generated insights from the Cortex job.',
};

export default async function HomePage() {
  const insights = await getInsights();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            AI Insights Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Insights are generated automatically on the 1st of each month. You
            can also trigger a run manually below.
          </p>
        </header>

        <main>
          <InsightsDashboard initialInsights={insights} />
        </main>
      </div>
    </div>
  );
}
