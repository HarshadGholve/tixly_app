import { Bot } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "h-7 w-7", text: "text-base", dot: "text-xs" },
    md: { box: "h-9 w-9", text: "text-lg", dot: "text-sm" },
    lg: { box: "h-11 w-11", text: "text-2xl", dot: "text-base" },
  }[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`grid ${sizes.box} place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft`}
      >
        <Bot className="h-1/2 w-1/2" strokeWidth={2.2} />
      </div>
      <div className="flex items-baseline">
        <span className={`font-bold tracking-tight ${sizes.text}`}>Tixly</span>
        <span className={`font-medium text-muted-foreground ${sizes.dot}`}></span>
      </div>
    </div>
  );
}
