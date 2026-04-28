import { cn } from "@/lib/utils";

type RaceLaneProps = {
  name: string;
  complexity: string;
  color: "a" | "b";
  progress: number; // 0..1
  steps: number;
  timeMs: number | null;
  winner?: boolean;
  running?: boolean;
};

export function RaceLane({
  name,
  complexity,
  color,
  progress,
  steps,
  timeMs,
  winner,
  running,
}: RaceLaneProps) {
  const isA = color === "a";
  const racerColor = isA ? "hsl(var(--racer-a))" : "hsl(var(--racer-b))";
  const glow = isA ? "glow-cyan" : "glow-magenta";

  return (
    <div className="relative rounded-xl border border-border bg-card/60 backdrop-blur p-5 overflow-hidden">
      {winner && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold tracking-wider font-mono glow-lime">
          WINNER
        </div>
      )}

      <div className="flex items-baseline justify-between mb-1">
        <div>
          <h3
            className="text-xl font-display font-bold"
            style={{ color: racerColor }}
          >
            {name}
          </h3>
          <p className="text-xs font-mono text-muted-foreground">{complexity}</p>
        </div>
        <div className="text-right font-mono">
          <div className="text-2xl font-bold tabular-nums" style={{ color: racerColor }}>
            {timeMs === null ? "—" : `${timeMs.toFixed(3)}`}
            <span className="text-xs text-muted-foreground ml-1">ms</span>
          </div>
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {steps.toLocaleString()} steps
          </div>
        </div>
      </div>

      {/* Track */}
      <div className="relative mt-4 h-10 rounded-lg bg-muted/60 border border-border overflow-hidden">
        {/* Lane dashes */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 28px, hsl(var(--border)) 28px 32px)",
          }}
        />
        {/* Progress fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear",
            running && "track-shimmer",
          )}
          style={{
            width: `${Math.min(100, progress * 100)}%`,
            background: isA
              ? "linear-gradient(90deg, hsl(var(--racer-a) / 0.2), hsl(var(--racer-a) / 0.6))"
              : "linear-gradient(90deg, hsl(var(--racer-b) / 0.2), hsl(var(--racer-b) / 0.6))",
          }}
        />
        {/* Racer dot */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full transition-[left] duration-100 ease-linear",
            glow,
          )}
          style={{
            left: `calc(${Math.min(100, progress * 100)}% - 12px)`,
            background: racerColor,
          }}
        />
        {/* Finish line */}
        <div className="absolute right-0 inset-y-0 w-1 bg-accent/80" />
      </div>
    </div>
  );
}
