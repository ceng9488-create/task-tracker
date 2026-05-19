import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";
import type { Category, Filter, Priority, Task } from "../types/task";
import { ANIMATION_DURATION_MS, INITIAL_TASKS } from "../const/task";

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [input, setInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Work");
  const [filter, setFilter] = useState<Filter>("All");
  const [nextId, setNextId] = useState(5);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState<number | null>(null);
  const [confetti, setConfetti] = useState<{ x: number; y: number } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const editRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editId && editRef.current) editRef.current.focus();
  }, [editId]);

  const addTask = useCallback(() => {
    if (!input.trim()) return;
    const id = nextId;
    setTasks((previousTasks) => [
      ...previousTasks,
      {
        id,
        text: input.trim(),
        priority: selectedPriority,
        category: selectedCategory,
        isDone: false,
      },
    ]);
    setNextId((previousId) => previousId + 1);
    setInput("");
    setJustAdded(id);
    setTimeout(
      () => setJustAdded(null),
      ANIMATION_DURATION_MS.ADD_TASK_HIGHLIGHT,
    );
  }, [input, selectedPriority, selectedCategory, nextId]);

  const toggleTask = (
    id: number,
    e: MouseEvent<HTMLDivElement>,
  ) => {
    const task = tasks.find((task) => task.id === id);
    if (task && !task.isDone) {
      setJustCompleted(id);
      const rect = e.currentTarget.getBoundingClientRect();
      const listRect = listRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };
      setConfetti({
        x: rect.left - listRect.left + 11,
        y: rect.top - listRect.top + 11,
      });
      setTimeout(() => {
        setJustCompleted(null);
        setConfetti(null);
      }, ANIMATION_DURATION_MS.COMPLETION_CELEBRATE);
    }
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id ? { ...task, isDone: !task.isDone } : task,
      ),
    );
  };

  const removeTask = (id: number) => {
    setRemoving(id);
    setTimeout(() => {
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
      setRemoving(null);
    }, ANIMATION_DURATION_MS.REMOVE_SLIDE_OUT);
  };

  const startEdit = (task: Task) => {
    setEditId(task.id);
    setEditText(task.text);
  };
  const confirmEdit = () => {
    if (editText.trim())
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === editId ? { ...task, text: editText.trim() } : task,
        ),
      );
    setEditId(null);
    setEditText("");
  };

  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    id: number,
  ) => {
    setDragId(id);
    event.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (
    event: DragEvent<HTMLDivElement>,
    id: number,
  ) => {
    event.preventDefault();
    if (id !== dragId) setDragOverId(id);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>, targetId: number) => {
    event.preventDefault();
    if (dragId == null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    setTasks((previousTasks) => {
      const reorderedTasks = [...previousTasks];
      const fromIdx = reorderedTasks.findIndex((task) => task.id === dragId);
      const toIdx = reorderedTasks.findIndex((task) => task.id === targetId);
      const [moved] = reorderedTasks.splice(fromIdx, 1);
      reorderedTasks.splice(toIdx, 0, moved);
      return reorderedTasks;
    });
    setDragId(null);
    setDragOverId(null);
  };
  const onDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
  };

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
    // state for rendering
    tasks,
    visible,
    filter,
    input,
    selectedPriority,
    selectedCategory,
    editId,
    editText,
    dragId,
    dragOverId,
    justCompleted,
    confetti,
    removing,
    justAdded,
    editRef,
    listRef,

    // computed values
    total,
    doneCount,
    remaining,
    pct,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,

    // setters
    setFilter,
    setInput,
    setSelectedPriority,
    setSelectedCategory,
    setConfetti,
    setEditId,
    setEditText,

    // actions
    addTask,
    toggleTask,
    removeTask,
    startEdit,
    confirmEdit,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
}
