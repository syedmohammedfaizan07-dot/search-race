import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ModeSelector, type RaceMode } from "@/components/ModeSelector";
import { RaceLane } from "@/components/RaceLane";
import { ResultChart } from "@/components/ResultChart";
import {
  binarySearch,
  bubbleSort,
  generateArray,
  linearSearch,
  listMembership,
  mergeSort,
  pickRandom,
  setMembership,
  type AlgoResult,
} from "@/lib/algorithms";
import { Flag, Play, RotateCcw, Zap } from "lucide-react";

type LaneState = {
  name: string;
  complexity: string;
  steps: number;
  timeMs: number | null;
  progress: number;
};

const DEFAULT_SIZES: Record<RaceMode, number> = {
  search: 20000,
  sort: 1500,
  lookup: 50000,
};

const MAX_SIZES: Record<RaceMode, number> = {
  search: 200000,
  sort: 5000,
  lookup: 500000,
};

export default function Index() {
  const [mode, setMode] = useState<RaceMode>("search");
  const [size, setSize] = useState(DEFAULT_SIZES.search);
  const [running, setRunning] = useState(false);
  const [laneA, setLaneA] = useState<LaneState>(initLane("A", mode));
  const [laneB, setLaneB] = useState<LaneState>(initLane("B", mode));
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  const handleModeChange = useCallback((m: RaceMode) => {
    setMode(m);
    setSize(DEFAULT_SIZES[m]);
    setLaneA(initLane("A", m));
    setLaneB(initLane("B", m));
    setWinner(null);
    setSummary(null);
  }, []);

  const reset = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setLaneA(initLane("A", mode));
    setLaneB(initLane("B", mode));
    setWinner(null);
    setSummary(null);
    setRunning(false);
  }, [mode]);

  const run = useCallback(async () => {
    setRunning(true);
    setWinner(null);
    setSummary(null);
    setLaneA((l) => ({ ...initLane("A", mode), name: l.name, complexity: l.complexity, progress: 0 }));
    setLaneB((l) => ({ ...initLane("B", mode), name: l.name, complexity: l.complexity, progress: 0 }));

    // Let the UI paint reset state
    await new Promise((r) => setTimeout(r, 60));

    let a: AlgoResult;
    let b: AlgoResult;
    let aMeta = initLane("A", mode);
    let bMeta = initLane("B", mode);

    if (mode === "search") {
      const arr = generateArray(size, true);
      const target = pickRandom(arr);
      a = linearSearch(arr, target);
      b = binarySearch(arr, target);
      aMeta = { ...aMeta, name: "Linear Search", complexity: "O(n)" };
      bMeta = { ...bMeta, name: "Binary Search", complexity: "O(log n)" };
    } else if (mode === "sort") {
      const arr = generateArray(size, false);
      a = bubbleSort(arr);
      b = mergeSort(arr);
      aMeta = { ...aMeta, name: "Bubble Sort", complexity: "O(n²)" };
      bMeta = { ...bMeta, name: "Merge Sort", complexity: "O(n log n)" };
    } else {
      const arr = generateArray(size, false);
      const set = new Set(arr);
      const target = pickRandom(arr);
      a = listMembership(arr, target);
      b = setMembership(set, target);
      aMeta = { ...aMeta, name: "List Membership", complexity: "O(n)" };
      bMeta = { ...bMeta, name: "Set Membership", complexity: "O(1)" };
    }

    const aTime = Math.max(a.timeMs, 0.001);
    const bTime = Math.max(b.timeMs, 0.001);
    const maxTime = Math.max(aTime, bTime);

    // Animate the race over ~1.2s mapped to real time proportions
    const animMs = 1200;
    const aDuration = (aTime / maxTime) * animMs;
    const bDuration = (bTime / maxTime) * animMs;
    const start = performance.now();

    const tick = () => {
      const now = performance.now();
      const elapsed = now - start;
      const pa = Math.min(1, elapsed / aDuration);
      const pb = Math.min(1, elapsed / bDuration);

      setLaneA({
        ...aMeta,
        progress: pa,
        steps: Math.round(a.steps * pa),
        timeMs: pa >= 1 ? a.timeMs : null,
      });
      setLaneB({
        ...bMeta,
        progress: pb,
        steps: Math.round(b.steps * pb),
        timeMs: pb >= 1 ? b.timeMs : null,
      });

      if (pa < 1 || pb < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        const win: "A" | "B" = a.timeMs <= b.timeMs ? "A" : "B";
        setWinner(win);
        setSummary(buildSummary(mode, size, a, b, aMeta.name, bMeta.name));
        setRunning(false);
      }
    };

    frame.current = requestAnimationFrame(tick);
  }, [mode, size]);

  const stepChart = useMemo(
    () => [
      { name: laneA.name, value: laneA.steps, color: "a" as const },
      { name: laneB.name, value: laneB.steps, color: "b" as const },
    ],
    [laneA, laneB],
  );

  const timeChart = useMemo(
    () => [
      { name: laneA.name, value: Number((laneA.timeMs ?? 0).toFixed(4)), color: "a" as const },
      { name: laneB.name, value: Number((laneB.timeMs ?? 0).toFixed(4)), color: "b" as const },
    ],
    [laneA, laneB],
  );

  const max = MAX_SIZES[mode];

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Algorithm Showdown</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight">
            Search
            <span className="text-primary"> Race</span>
            <span className="text-secondary">.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
            Pit classic algorithms against each other. Watch them race in real
            time — and see why Big-O isn't just theory.
          </p>
        </header>

        {/* Controls */}
        <section className="rounded-2xl border border-border bg-card/40 backdrop-blur p-6 md:p-8 mb-8">
          <div className="grid md:grid-cols-[2fr,1fr] gap-8">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 block">
                Race type
              </label>
              <ModeSelector value={mode} onChange={handleModeChange} disabled={running} />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Dataset size
                </label>
                <span className="font-mono font-bold text-primary tabular-nums">
                  {size.toLocaleString()}
                </span>
              </div>
              <Slider
                min={100}
                max={max}
                step={Math.max(100, Math.floor(max / 200))}
                value={[size]}
                onValueChange={(v) => setSize(v[0])}
                disabled={running}
              />
              <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
                <span>100</span>
                <span>{max.toLocaleString()}</span>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  size="lg"
                  onClick={run}
                  disabled={running}
                  className="flex-1 font-display font-bold text-base h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {running ? "Racing..." : "Start Race"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={reset}
                  disabled={running}
                  className="h-12"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Track */}
        <section className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Flag className="h-3.5 w-3.5" />
            <span>The Track</span>
          </div>
          <RaceLane
            {...laneA}
            color="a"
            running={running}
            winner={winner === "A"}
          />
          <RaceLane
            {...laneB}
            color="b"
            running={running}
            winner={winner === "B"}
          />
        </section>

        {/* Charts */}
        <section className="grid md:grid-cols-2 gap-4 mb-8">
          <ResultChart title="Execution time" unit="ms" data={timeChart} />
          <ResultChart title="Step count" unit="steps" data={stepChart} />
        </section>

        {/* Summary */}
        {summary && (
          <section className="rounded-2xl border border-accent/40 bg-accent/5 p-6 glow-lime">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent mb-3">
              <Zap className="h-3.5 w-3.5" />
              <span>Race Analysis</span>
            </div>
            <p className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </section>
        )}

        <footer className="mt-16 pt-8 border-t border-border text-center text-xs font-mono text-muted-foreground">
          Built for understanding algorithms — not just timing them.
        </footer>
      </div>
    </div>
  );
}

function initLane(which: "A" | "B", mode: RaceMode): LaneState {
  const defaults: Record<RaceMode, [LaneState, LaneState]> = {
    search: [
      { name: "Linear Search", complexity: "O(n)", steps: 0, timeMs: null, progress: 0 },
      { name: "Binary Search", complexity: "O(log n)", steps: 0, timeMs: null, progress: 0 },
    ],
    sort: [
      { name: "Bubble Sort", complexity: "O(n²)", steps: 0, timeMs: null, progress: 0 },
      { name: "Merge Sort", complexity: "O(n log n)", steps: 0, timeMs: null, progress: 0 },
    ],
    lookup: [
      { name: "List Membership", complexity: "O(n)", steps: 0, timeMs: null, progress: 0 },
      { name: "Set Membership", complexity: "O(1)", steps: 0, timeMs: null, progress: 0 },
    ],
  };
  return which === "A" ? defaults[mode][0] : defaults[mode][1];
}

function buildSummary(
  mode: RaceMode,
  size: number,
  a: AlgoResult,
  b: AlgoResult,
  aName: string,
  bName: string,
): string {
  const winner = a.timeMs <= b.timeMs ? aName : bName;
  const loser = a.timeMs <= b.timeMs ? bName : aName;
  const fast = Math.min(a.timeMs, b.timeMs);
  const slow = Math.max(a.timeMs, b.timeMs);
  const ratio = fast > 0 ? (slow / fast).toFixed(1) : "∞";

  const why: Record<RaceMode, string> = {
    search:
      "Binary search halves the search space each step (O(log n)), while linear search walks every element (O(n)). On sorted data, binary scales far better.",
    sort:
      "Merge sort splits and merges in O(n log n). Bubble sort compares adjacent pairs across many passes — O(n²) — so it slows dramatically as n grows.",
    lookup:
      "Sets use hashing for constant-time lookup (O(1)). Lists must scan element by element (O(n)). For large datasets with frequent lookups, sets win easily.",
  };

  return [
    `🏆 ${winner} wins — about ${ratio}× faster than ${loser} on ${size.toLocaleString()} items.`,
    `📊 Steps: ${a.steps.toLocaleString()} (${aName}) vs ${b.steps.toLocaleString()} (${bName}).`,
    `💡 ${why[mode]}`,
  ].join("\n\n");
}
