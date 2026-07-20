import { useCallback, useEffect, useState } from "react";
import type { Category, Priority, Recurring, Task } from "../types/task";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    text: row.text as string,
    priority: row.priority as Task["priority"],
    category: row.category as Task["category"],
    isDone: false,
    position: row.position as number,
    completedAt: null,
    createdAt: (row.created_at as string | null) ?? null,
    inPool: true,
    timerMinutes: (row.timer_minutes as number | null) ?? null,
    recurring: ((row.recurring as string) ?? "none") as Task["recurring"],
    isInProgress: row.isInProgress as boolean
  };
}

export function useTaskPool() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    db()
      .from("tasks")
      .select("*")
      .eq("in_pool", true)
      .eq("is_done", false)
      .order("position", { ascending: true })
      .then(({ data }) => {
        setTasks(data ? data.map(rowToTask) : []);
        setLoading(false);
      });
  }, [session]);

  const addTask = useCallback(
    async (text: string, priority: Priority, category: Category, timerMinutes?: number | null, recurring?: Recurring) => {
      if (!text.trim() || !session) return;
      const maxPosition = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) : -1;

      const { data, error } = await db()
        .from("tasks")
        .insert({
          text: text.trim(),
          priority,
          category,
          is_done: false,
          in_pool: true,
          user_id: session.user.id,
          position: maxPosition + 1,
          timer_minutes: timerMinutes ?? null,
          recurring: recurring ?? "none",
        })
        .select()
        .single();

      if (error || !data) return;
      setTasks((prev) => [...prev, rowToTask(data)]);
    },
    [tasks, session],
  );

  const removeTask = useCallback(async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await db().from("tasks").delete().eq("id", id);
  }, []);

  const scheduleForToday = useCallback(async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await db().from("tasks").update({ in_pool: false }).eq("id", id);
  }, []);

  const updateTaskText = useCallback(async (id: number, text: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    await db().from("tasks").update({ text }).eq("id", id);
  }, []);

  return { tasks, loading, addTask, removeTask, scheduleForToday, updateTaskText };
}
