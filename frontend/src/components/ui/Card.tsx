type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-200/50 backdrop-blur-sm ${
        hover ? "transition hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
