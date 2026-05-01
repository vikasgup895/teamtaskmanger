export default function StatCard({ label, value, icon: Icon, variant = 'default', description }) {
  return (
    <div className={`stat-card stat-card-${variant} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            variant === 'success' ? 'bg-green-50 text-green-600' :
            variant === 'danger'  ? 'bg-red-50 text-red-500' :
            variant === 'warning' ? 'bg-amber-50 text-amber-600' :
            variant === 'purple'  ? 'bg-violet-50 text-violet-600' :
            variant === 'info'    ? 'bg-cyan-50 text-cyan-600' :
                                    'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
