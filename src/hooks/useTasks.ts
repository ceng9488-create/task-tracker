import { useCallback, useState } from "react";
import { ANIMATION_DURATION_MS, INITIAL_TASKS } from "../const/task";
import type { Category, Filter, Priority, Task } from "../types/task";



export function useTasks(filter: Filter) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);

  const addTask = useCallback((text: string, priority: Priority, category: Category) => {
    if (!text.trim()) return;
    const id = Date.now();
    setTasks((previousTasks) => [
      ...previousTasks,
      {
        id,
        text: text.trim(),
        priority: priority,
        category: category,
        isDone: false,
      },
    ]);
    setJustAdded(id);
    setTimeout(
      () => setJustAdded(null),
      ANIMATION_DURATION_MS.ADD_TASK_HIGHLIGHT,
    );
  }, []);

  const toggleTask = useCallback(
    (id: number) => {
      const task = tasks.find((task) => task.id === id);
      if (task && !task.isDone) {
        setJustCompleted(id);

        setTimeout(() => {
          setJustCompleted(null);
        }, ANIMATION_DURATION_MS.COMPLETION_CELEBRATE);
      }
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === id ? { ...task, isDone: !task.isDone } : task,
        ),
      );
    },
    [tasks],
  );

  const removeTask = useCallback((id: number) => {
    setRemoving(id);
    setTimeout(() => {
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
      setRemoving(null);
    }, ANIMATION_DURATION_MS.REMOVE_SLIDE_OUT);
  }, []);

  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.isDone).length;
  const remaining = total - doneCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  const highPriorityCount = tasks.filter((task) => task.priority === "high" && !task.isDone).length;
  const mediumPriorityCount = tasks.filter((task) => task.priority === "medium" && !task.isDone).length;
  const lowPriorityCount = tasks.filter((task) => task.priority === "low" && !task.isDone).length;

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
    removeTask
  }
}
