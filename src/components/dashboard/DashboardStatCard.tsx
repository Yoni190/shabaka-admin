import type { ComponentType, ReactNode } from "react";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon?: ComponentType<{ className?: string }>;
  hint?: ReactNode;
}

export default function DashboardStatCard({
  label,
  value,
  icon: Icon,
  hint,
}: DashboardStatCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** Skeleton shown while the dashboard request is in flight. */
export function DashboardStatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-24 rounded bg-slate-100" />
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-4 h-7 w-16 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
    </div>
  );
}