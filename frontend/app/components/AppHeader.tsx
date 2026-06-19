import ThemeToggle from './ThemeToggle';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold text-[var(--color-text-heading)]">
          AI Insights
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
