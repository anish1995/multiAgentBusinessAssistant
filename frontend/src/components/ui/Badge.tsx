type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function statusVariant(status: string): BadgeVariant {
  const normalized = status.toUpperCase();

  if (["PAID", "WON", "RESOLVED", "CLOSED", "QUALIFIED"].includes(normalized)) {
    return "success";
  }
  if (["OVERDUE", "HIGH", "LOST", "CANCELLED"].includes(normalized)) {
    return "danger";
  }
  if (["OPEN", "NEW", "SENT", "IN_PROGRESS", "CONTACTED"].includes(normalized)) {
    return "warning";
  }
  if (["DRAFT", "PENDING", "MEDIUM"].includes(normalized)) {
    return "info";
  }
  return "default";
}
