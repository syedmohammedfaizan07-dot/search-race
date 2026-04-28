// Algorithm implementations with step counting and optional per-step callbacks.
// All functions return { result, steps, timeMs } and operate on copies so the
// original data is never mutated.

export type AlgoResult<T = unknown> = {
  result: T;
  steps: number;
  timeMs: number;
};

const nowMs = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

// ---------- Search ----------

export function linearSearch(arr: number[], target: number): AlgoResult<number> {
  const start = nowMs();
  let steps = 0;
  let found = -1;
  for (let i = 0; i < arr.length; i++) {
    steps++;
    if (arr[i] === target) {
      found = i;
      break;
    }
  }
  return { result: found, steps, timeMs: nowMs() - start };
}

export function binarySearch(sorted: number[], target: number): AlgoResult<number> {
  const start = nowMs();
  let steps = 0;
  let lo = 0;
  let hi = sorted.length - 1;
  let found = -1;
  while (lo <= hi) {
    steps++;
    const mid = (lo + hi) >> 1;
    const v = sorted[mid];
    if (v === target) {
      found = mid;
      break;
    } else if (v < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return { result: found, steps, timeMs: nowMs() - start };
}

// ---------- Sort ----------

export function bubbleSort(input: number[]): AlgoResult<number[]> {
  const arr = input.slice();
  const start = nowMs();
  let steps = 0;
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      steps++;
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { result: arr, steps, timeMs: nowMs() - start };
}

export function mergeSort(input: number[]): AlgoResult<number[]> {
  const start = nowMs();
  let steps = 0;

  const merge = (left: number[], right: number[]): number[] => {
    const out: number[] = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      steps++;
      if (left[i] <= right[j]) out.push(left[i++]);
      else out.push(right[j++]);
    }
    while (i < left.length) {
      steps++;
      out.push(left[i++]);
    }
    while (j < right.length) {
      steps++;
      out.push(right[j++]);
    }
    return out;
  };

  const sort = (a: number[]): number[] => {
    if (a.length <= 1) return a;
    const mid = a.length >> 1;
    return merge(sort(a.slice(0, mid)), sort(a.slice(mid)));
  };

  const result = sort(input.slice());
  return { result, steps, timeMs: nowMs() - start };
}

// ---------- Membership ----------

export function listMembership(arr: number[], target: number): AlgoResult<boolean> {
  const start = nowMs();
  let steps = 0;
  let found = false;
  for (let i = 0; i < arr.length; i++) {
    steps++;
    if (arr[i] === target) {
      found = true;
      break;
    }
  }
  return { result: found, steps, timeMs: nowMs() - start };
}

export function setMembership(set: Set<number>, target: number): AlgoResult<boolean> {
  const start = nowMs();
  // Set.has is O(1) average — count as a single step.
  const found = set.has(target);
  return { result: found, steps: 1, timeMs: nowMs() - start };
}

// ---------- Helpers ----------

export function generateArray(size: number, sorted = false): number[] {
  const arr = new Array<number>(size);
  for (let i = 0; i < size; i++) {
    arr[i] = Math.floor(Math.random() * size * 4);
  }
  if (sorted) arr.sort((a, b) => a - b);
  return arr;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
