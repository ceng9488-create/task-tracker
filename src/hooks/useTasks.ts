import { useCallback, useEffect, useState } from "react";
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
    position: row.position as number,
    completedAt: (row.completed_at as string | null) ?? null,
  };
}
export function useTasks(filter: Filter) {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, setLoading] = useState(true);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true })
      .then(({ data }) => {
        setTasks(data ? data.map(rowToTask) : []);
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
          user_id: session.user.id,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error || !data) return;
      const newTask = rowToTask(data);
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
      const task = tasks.find((task) => task.id === id);
      if (!task) return;
      if (task && !task.isDone) {
        setJustCompleted(id);

        setTimeout(() => {
          setJustCompleted(null);
        }, ANIMATION_DURATION_MS.COMPLETION_CELEBRATE);
      }
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                isDone: !task.isDone,
                completedAt: !task.isDone ? new Date().toISOString() : null,
              }
            : task,
        ),
      );
      const nowDone = !task.isDone;
      const completedAt = nowDone ? new Date().toISOString() : null;
      await supabase
        .from("tasks")
        .update({ is_done: nowDone, completed_at: completedAt })
        .eq("id", id);
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

  let visible = tasks;
  if (filter === "Active") visible = tasks.filter((task) => !task.isDone);
  else if (filter === "Done") visible = tasks.filter((task) => task.isDone);
  else if (filter === "High priority")
    visible = tasks.filter((task) => task.priority === "high" && !task.isDone);

  return {
    visible,
    tasks,
    setTasks,
    justCompleted,
    removing,
    justAdded,

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
