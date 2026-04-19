import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; direction: "up" | "down"; positive?: boolean };
  badge?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, trend, badge, footer, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:shadow-elevated",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-200/70 text-brand-700">
            {icon}
          </div>
        )}
        {badge}
      </div>
      <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      {trend && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            (trend.positive ?? trend.direction === "up")
              ? "text-status-resolved-foreground"
              : "text-status-critical-foreground",
          )}
        >
          <span>{trend.direction === "up" ? "▲" : "▼"}</span>
          <span>{trend.value}</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
      {footer}
    </div>
  );
}
