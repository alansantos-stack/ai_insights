'use client';

import { useState, useCallback } from 'react';
import { triggerInsights } from '@/app/lib/api';

interface TriggerButtonProps {
  onSuccess?: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function TriggerButton({ onSuccess }: TriggerButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleClick = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      await triggerInsights();
      setStatus('success');
      onSuccess?.();
      // Reset to idle after 3 seconds so the message doesn't linger
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [onSuccess]);

  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-label="Manually trigger the AI insights job"
        className={[
          'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          isLoading
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
        ].join(' ')}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading ? 'Running...' : 'Run Now (Manual Trigger)'}
      </button>

      {status === 'success' && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-green-700 font-medium"
        >
          Job triggered successfully. New insights will appear shortly.
        </p>
      )}

      {status === 'error' && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-700 font-medium"
        >
          Error: {errorMessage}
        </p>
      )}
    </div>
  );
}
