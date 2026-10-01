interface AdminMobileHeaderProps {
  onMenuClick: () => void;
}

export default function AdminMobileHeader({
  onMenuClick,
}: AdminMobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <span className="text-sm font-semibold text-slate-900">
        Admin Dashboard
      </span>
    </header>
  );
}