interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {description ?? "This section is coming soon."}
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          Nothing here yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {title} management will be built in a future iteration.
        </p>
      </div>
    </div>
  );
}