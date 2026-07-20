import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import type { DayHistory } from "../types/task";

const TZ = "Asia/Singapore";

function getMondaySGT(weekOffset: number): string {
  const todaySGT = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  const today = new Date(todaySGT + "T00:00:00");
  const dow = today.getDay(); // 0=Sun
  const daysToMonday = dow === 0 ? -6 : 1 - dow;
  today.setDate(today.getDate() + daysToMonday + weekOffset * 7);
  return today.toISOString().slice(0, 10);
}

export function useWeeklySummary(weekOffset: number = 0) {
  const { session } = useAuth();
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    setLoading(true);

    const monday = getMondaySGT(weekOffset);
    const sundayDate = new Date(monday + "T00:00:00");
    sundayDate.setDate(sundayDate.getDate() + 6);
    const sunday = sundayDate.toISOString().slice(0, 10);

    const from = new Date(monday + "T00:00:00+08:00").toISOString();
    const to   = new Date(sunday + "T23:59:59+08:00").toISOString();

    const completedQ = db()
      .from("tasks")
      .select("id, text, priority, category, created_at, completed_at")
      .eq("in_pool", false)
      .gte("completed_at", from)
      .lte("completed_at", to)
      .order("completed_at", { ascending: false });

    const pendingQ = db()
      .from("tasks")
      .select("id, text, priority, category, created_at, completed_at")
      .eq("in_pool", false)
      .gte("created_at", from)
      .lte("created_at", to)
      .eq("is_done", false);

    Promise.all([completedQ, pendingQ]).then(([{ data: completed }, { data: pending }]) => {
      const map: Record<string, DayHistory> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday + "T00:00:00+08:00");
        d.setDate(d.getDate() + i);
        const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
        map[key] = { date: key, total: 0, high: 0, medium: 0, low: 0, health: 0, work: 0, learning: 0, personal: 0, tasks: [], pendingTasks: [] };
      }
      for (const row of completed ?? []) {
        const key = new Date(row.completed_at as string).toLocaleDateString("en-CA", { timeZone: TZ });
        if (map[key]) {
          map[key].total++;
          map[key][row.priority as "high" | "medium" | "low"]++;
          map[key][(row.category as string).toLowerCase() as "health" | "work" | "learning" | "personal"]++;
          map[key].tasks.push({
            id: row.id as number,
            text: row.text as string,
            priority: row.priority as "high" | "medium" | "low",
            category: row.category as "Work" | "Health" | "Learning" | "Personal",
            createdAt: (row.created_at as string | null) ?? null,
            completedAt: row.completed_at as string | null,
          });
        }
      }
      for (const row of pending ?? []) {
        const key = new Date(row.created_at as string).toLocaleDateString("en-CA", { timeZone: TZ });
        if (map[key]) {
          map[key].pendingTasks.push({
            id: row.id as number,
            text: row.text as string,
            priority: row.priority as "high" | "medium" | "low",
            category: row.category as "Work" | "Health" | "Learning" | "Personal",
            createdAt: (row.created_at as string | null) ?? null,
            completedAt: null,
          });
        }
      }
      setHistory(Object.values(map));
      setLoading(false);
    });
  }, [session, weekOffset]);

  return { history, loading };
}
