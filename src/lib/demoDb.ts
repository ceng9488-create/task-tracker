// Minimal in-memory stand-in for the subset of the Supabase query API the app
// uses. Backs "demo mode", where the login step is bypassed and nothing leaves
// the browser.

export const DEMO_USER_ID = "demo-user";
const STORAGE_KEY = "demo-tasks";

type Row = Record<string, unknown>;

function isoDaysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let nextId = 1;

function row(partial: Row): Row {
  return {
    id: nextId++,
    user_id: DEMO_USER_ID,
    is_done: false,
    is_in_progress: false,
    in_pool: false,
    priority: "medium",
    category: "Work",
    position: 0,
    completed_at: null,
    created_at: isoDaysAgo(0, 8),
    timer_minutes: null,
    recurring: "none",
    ...partial,
  };
}

function seed(): Row[] {
  return [
    // Today's list
    row({ text: "Review pull requests", priority: "high", category: "Work", position: 0 }),
    row({ text: "30 min walk", priority: "medium", category: "Health", position: 1, is_in_progress: true }),
    row({ text: "Read a chapter of Designing Data-Intensive Applications", priority: "low", category: "Learning", position: 2 }),
    row({ text: "Stand-up notes", priority: "medium", category: "Work", position: 3, is_done: true, completed_at: isoDaysAgo(0, 9) }),

    // Task pool
    row({ text: "Plan Q3 roadmap", priority: "high", category: "Work", position: 0, in_pool: true, timer_minutes: 45 }),
    row({ text: "Stretch routine", priority: "low", category: "Health", position: 1, in_pool: true, recurring: "daily" }),
    row({ text: "Finish TypeScript course", priority: "medium", category: "Learning", position: 2, in_pool: true }),
    row({ text: "Call the dentist", priority: "medium", category: "Personal", position: 3, in_pool: true }),

    // Earlier this week, for the summary view
    row({ text: "Ship login redesign", priority: "high", category: "Work", position: 4, is_done: true, created_at: isoDaysAgo(1, 9), completed_at: isoDaysAgo(1, 17) }),
    row({ text: "Morning run", priority: "medium", category: "Health", position: 5, is_done: true, created_at: isoDaysAgo(1, 7), completed_at: isoDaysAgo(1, 8) }),
    row({ text: "Write weekly update", priority: "low", category: "Work", position: 6, is_done: true, created_at: isoDaysAgo(2, 9), completed_at: isoDaysAgo(2, 16) }),
    row({ text: "Grocery run", priority: "low", category: "Personal", position: 7, is_done: true, created_at: isoDaysAgo(3, 11), completed_at: isoDaysAgo(3, 12) }),
    row({ text: "Debug pomodoro timer", priority: "high", category: "Work", position: 8, is_done: true, created_at: isoDaysAgo(3, 13), completed_at: isoDaysAgo(3, 15) }),
  ];
}

function load(): Row[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const rows = JSON.parse(raw) as Row[];
      nextId = rows.reduce((max, r) => Math.max(max, r.id as number), 0) + 1;
      return rows;
    } catch {
      /* fall through to a fresh seed */
    }
  }
  const rows = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  return rows;
}

let rows: Row[] | null = null;

function table(): Row[] {
  if (rows === null) rows = load();
  return rows;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(table()));
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  rows = null;
}

type Filter = (r: Row) => boolean;

function compare(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

// Parses one PostgREST filter expression, e.g. "created_at.gte.2024-01-01".
function parseFilter(expr: string): Filter {
  const first = expr.indexOf(".");
  const second = expr.indexOf(".", first + 1);
  const column = expr.slice(0, first);
  const op = expr.slice(first + 1, second);
  const raw = expr.slice(second + 1);
  const value = raw === "true" ? true : raw === "false" ? false : raw;
  return (r) => {
    const actual = r[column];
    if (op === "eq") return actual === value;
    if (op === "gte") return actual != null && compare(actual, value) >= 0;
    if (op === "lte") return actual != null && compare(actual, value) <= 0;
    return true;
  };
}

class Query implements PromiseLike<{ data: Row[] | Row | null; error: null }> {
  private filters: Filter[] = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private singleRow = false;

  private op: "select" | "insert" | "update" | "delete";
  private payload?: Row;

  constructor(op: "select" | "insert" | "update" | "delete", payload?: Row) {
    this.op = op;
    this.payload = payload;
  }

  eq(column: string, value: unknown) {
    this.filters.push((r) => r[column] === value);
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push((r) => r[column] != null && compare(r[column], value) >= 0);
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push((r) => r[column] != null && compare(r[column], value) <= 0);
    return this;
  }

  or(expression: string) {
    const parts = expression.split(",").map(parseFilter);
    this.filters.push((r) => parts.some((f) => f(r)));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.sort = { column, ascending: options?.ascending ?? true };
    return this;
  }

  select() {
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  maybeSingle() {
    return this.single();
  }

  private run(): { data: Row[] | Row | null; error: null } {
    const all = table();
    const matches = (r: Row) => this.filters.every((f) => f(r));

    if (this.op === "insert") {
      const inserted = row({ ...this.payload, id: nextId++ });
      all.push(inserted);
      persist();
      return { data: this.singleRow ? inserted : [inserted], error: null };
    }

    if (this.op === "update") {
      const updated: Row[] = [];
      for (const r of all) {
        if (matches(r)) {
          Object.assign(r, this.payload);
          updated.push(r);
        }
      }
      persist();
      return { data: this.singleRow ? (updated[0] ?? null) : updated, error: null };
    }

    if (this.op === "delete") {
      const kept = all.filter((r) => !matches(r));
      all.length = 0;
      all.push(...kept);
      persist();
      return { data: [], error: null };
    }

    const result = all.filter(matches).map((r) => ({ ...r }));
    if (this.sort) {
      const { column, ascending } = this.sort;
      result.sort((a, b) => (ascending ? 1 : -1) * compare(a[column], b[column]));
    }
    return { data: this.singleRow ? (result[0] ?? null) : result, error: null };
  }

  then<TResult1 = { data: Row[] | Row | null; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: Row[] | Row | null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.run()).then(onfulfilled, onrejected);
  }
}

// Extra arguments callers pass (table name, column list) are ignored: the demo
// store has a single table and always returns whole rows.
export const demoClient = {
  from() {
    return {
      select: () => new Query("select"),
      insert: (payload: Row) => new Query("insert", payload),
      update: (payload: Row) => new Query("update", payload),
      delete: () => new Query("delete"),
    };
  },
};
