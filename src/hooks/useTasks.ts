import { useCallback, useEffect, useRef, useState } from "react";
import { ANIMATION_DURATION_MS } from "../const/task";
import type { Category, Filter, Priority, Task } from "../types/task";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as number,
    text: row.text as string,
    priority: row.priority as Task["priority"],
    category: row.category as Task["category"],
    isDone: row.is_done as boolean,
    isInProgress: (row.is_in_progress as boolean) ?? false,
    position: row.position as number,
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: (row.created_at as string | null) ?? null,
    inPool: (row.in_pool as boolean) ?? false,
  };
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs > 0 ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

export interface CompletionPopup {
  taskText: string;
  elapsed: string;
}

export function useTasks(filter: Filter) {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [completionPopup, setCompletionPopup] = useState<CompletionPopup | null>(null);
  const startTimesRef = useRef<Record<number, number>>({});

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    supabase
      .from("tasks")
      .select("*")
      .eq("in_pool", false)
      .or(`created_at.gte.${todayStart.toISOString()},is_done.eq.false,completed_at.gte.${todayStart.toISOString()}`)
      .order("position", { ascending: true })
      .then(({ data }) => {
        const loaded = data ? data.map(rowToTask) : [];
        const now = Date.now();
        for (const t of loaded) {
          if (!t.isDone) startTimesRef.current[t.id] = now;
        }
        setTasks(loaded);
        setLoading(false);
      });
  }, [session]);

  const addTask = useCallback(
    async (text: string, priority: Priority, category: Category) => {
      if (!text.trim() || !session) return;
      const maxPosition =
        tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) : -1;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          text: text.trim(),
          priority,
          category,
          is_done: false,
          is_in_progress: false,
          in_pool: false,
          user_id: session.user.id,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error || !data) return;
      const newTask = rowToTask(data);
      startTimesRef.current[newTask.id] = Date.now();
      setTasks((previousTasks) => [...previousTasks, newTask]);
      setJustAdded(newTask.id);
      setTimeout(
        () => setJustAdded(null),
        ANIMATION_DURATION_MS.ADD_TASK_HIGHLIGHT,
      );
    },
    [tasks, session],
  );

  const toggleTask = useCallback(
    async (id: number) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.isDone) return;

      if (!task.isInProgress) {
        // pending → in progress
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isInProgress: true } : t)),
        );
        await supabase.from("tasks").update({ is_in_progress: true }).eq("id", id);
      } else {
        // in progress → done
        setJustCompleted(id);
        setTimeout(() => setJustCompleted(null), ANIMATION_DURATION_MS.COMPLETION_CELEBRATE);

        const startTime = startTimesRef.current[id];
        if (startTime) {
          const elapsed = formatElapsed(Date.now() - startTime);
          setCompletionPopup({ taskText: task.text, elapsed });
          setTimeout(() => setCompletionPopup(null), 4000);
          delete startTimesRef.current[id];
        }

        const completedAt = new Date().toISOString();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, isDone: true, isInProgress: false, completedAt } : t,
          ),
        );
        await supabase
          .from("tasks")
          .update({ is_done: true, is_in_progress: false, completed_at: completedAt })
          .eq("id", id);
      }
    },
    [tasks],
  );

  const removeTask = useCallback((id: number) => {
    setRemoving(id);
    setTimeout(async () => {
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
      setRemoving(null);
      await supabase.from("tasks").delete().eq("id", id);
    }, ANIMATION_DURATION_MS.REMOVE_SLIDE_OUT);
  }, []);

  const updateTaskText = useCallback(async (id: number, text: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    await supabase.from("tasks").update({ text }).eq("id", id);
  }, []);

  const reorderedTasks = useCallback(async (newTasks: Task[]) => {
    setTasks(newTasks);
    await Promise.all(
      newTasks.map((task, index) =>
        supabase.from("tasks").update({ position: index }).eq("id", task.id),
      ),
    );
  }, []);

  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.isDone).length;
  const remaining = total - doneCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const highPriorityCount = tasks.filter(
    (task) => task.priority === "high" && !task.isDone,
  ).length;
  const mediumPriorityCount = tasks.filter(
    (task) => task.priority === "medium" && !task.isDone,
  ).length;
  const lowPriorityCount = tasks.filter(
    (task) => task.priority === "low" && !task.isDone,
  ).length;

  const visible =
    filter === "Pending"      ? tasks.filter((t) => !t.isDone && !t.isInProgress)
    : filter === "In Progress" ? tasks.filter((t) => !t.isDone && t.isInProgress)
    : filter === "Completed"   ? tasks.filter((t) => t.isDone)
    : filter === "High priority" ? tasks.filter((t) => t.priority === "high" && !t.isDone)
    : [...tasks].sort((a, b) => {
        const order = (t: Task) => (t.isDone ? 2 : t.isInProgress ? 1 : 0);
        return order(a) - order(b);
      });

  return {
    visible,
    tasks,
    setTasks,
    justCompleted,
    removing,
    justAdded,
    completionPopup,

    // computed values
    total,
    doneCount,
    remaining,
    pct,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,

    // actions
    addTask,
    toggleTask,
    removeTask,
    updateTaskText,
    reorderedTasks,
  };
}
