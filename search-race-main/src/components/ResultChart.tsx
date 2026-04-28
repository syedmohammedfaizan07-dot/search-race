import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Datum = { name: string; value: number; color: "a" | "b" };

type Props = {
  title: string;
  unit: string;
  data: Datum[];
};

export function ResultChart({ title, unit, data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <h4 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              stroke="hsl(var(--border))"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v.toLocaleString()} ${unit}`, title]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.color === "a"
                      ? "hsl(var(--racer-a))"
                      : "hsl(var(--racer-b))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
