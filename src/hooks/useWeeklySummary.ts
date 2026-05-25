import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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

    supabase
      .from("tasks")
      .select("id, text, priority, category, completed_at")
      .gte("completed_at", from)
      .lte("completed_at", to)
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, DayHistory> = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday + "T00:00:00");
          d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          map[key] = { date: key, total: 0, high: 0, medium: 0, low: 0, tasks: [] };
        }
        for (const row of data ?? []) {
          const key = new Date(row.completed_at as string).toLocaleDateString("en-CA", { timeZone: TZ });
          if (map[key]) {
            map[key].total++;
            map[key][row.priority as "high" | "medium" | "low"]++;
            map[key].tasks.push({
              id: row.id as number,
              text: row.text as string,
              priority: row.priority as "high" | "medium" | "low",
              category: row.category as "Work" | "Health" | "Learning" | "Personal",
              completedAt: row.completed_at as string,
            });
          }
        }
        setHistory(Object.values(map));
        setLoading(false);
      });
  }, [session, weekOffset]);

  return { history, loading };
}
