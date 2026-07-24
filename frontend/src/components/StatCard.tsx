import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
  accent?: "indigo" | "sky" | "amber" | "emerald";
};

const accents = {
  indigo: {
    bar: "from-indigo-500 to-violet-500",
    icon: "from-indigo-500/10 to-violet-500/5 text-indigo-600",
  },
  sky: {
    bar: "from-sky-500 to-cyan-500",
    icon: "from-sky-500/10 to-cyan-500/5 text-sky-600",
  },
  amber: {
    bar: "from-amber-500 to-orange-500",
    icon: "from-amber-500/10 to-orange-500/5 text-amber-600",
  },
  emerald: {
    bar: "from-emerald-500 to-teal-500",
    icon: "from-emerald-500/10 to-teal-500/5 text-emerald-600",
  },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "indigo",
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm shadow-slate-200/50 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accents[accent].bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accents[accent].icon}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
