import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { DayHistory } from "../types/task";

export function useWeeklySummary() {
  const { session } = useAuth();
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const since = new Date();
    since.setDate(since.getDate() - 6); // last 7 days including today
    since.setHours(0, 0, 0, 0);

    supabase
      .from("tasks")
      .select("id, text, priority, category, completed_at")
      .gte("completed_at", since.toISOString())
      .order("completed_at", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, DayHistory> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          map[key] = { date: key, total: 0, high: 0, medium: 0, low: 0, tasks: [] };
        }
        for (const row of data ?? []) {
          const key = (row.completed_at as string).slice(0, 10);
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
  }, [session]);

  return { history, loading };
}
