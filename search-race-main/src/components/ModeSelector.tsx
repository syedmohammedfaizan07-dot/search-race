import { cn } from "@/lib/utils";
import { Search, ArrowDownUp, Database } from "lucide-react";

export type RaceMode = "search" | "sort" | "lookup";

const MODES: {
  id: RaceMode;
  label: string;
  sub: string;
  icon: typeof Search;
}[] = [
  { id: "search", label: "Search", sub: "Linear vs Binary", icon: Search },
  { id: "sort", label: "Sort", sub: "Bubble vs Merge", icon: ArrowDownUp },
  { id: "lookup", label: "Lookup", sub: "List vs Set", icon: Database },
];

export function ModeSelector({
  value,
  onChange,
  disabled,
}: {
  value: RaceMode;
  onChange: (m: RaceMode) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {MODES.map((m) => {
        const active = value === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={cn(
              "group relative rounded-xl border p-4 text-left transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              active
                ? "border-primary bg-primary/5 glow-cyan"
                : "border-border bg-card/40 hover:border-primary/60 hover:bg-card/70",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 mb-2 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            />
            <div className="font-display font-bold">{m.label}</div>
            <div className="text-xs font-mono text-muted-foreground">{m.sub}</div>
          </button>
        );
      })}
    </div>
  );
}
