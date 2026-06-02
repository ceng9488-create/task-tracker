import { useCallback, useRef, useState } from "react";
import type { Category, Filter, Priority } from "../types/task";
import { useTasks } from "./useTasks";
import { useTaskEdit } from "./useTaskEdit";
import { useDragAndDrop } from "./useDragAndDrop";

export function useTaskManager() {
  const [filter, setFilter] = useState<Filter>("Pending");
  const [input, setInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium");
  const [selectedCategory, setSelectedCategory] = useState<Category>("Work");
  const listRef = useRef<HTMLDivElement>(null);

  const {
    tasks, visible,
    justCompleted, removing, justAdded, completionPopup,
    total, doneCount, remaining, pct,
    highPriorityCount, mediumPriorityCount, lowPriorityCount,
    addTask: addTaskToList, toggleTask, removeTask,
    updateTaskText, reorderedTasks
  } = useTasks(filter);

  const addTask = useCallback(() => {
    if (!input.trim()) return;
    addTaskToList(input, selectedPriority, selectedCategory);
    setInput("");
  }, [input, selectedPriority, selectedCategory, addTaskToList]);

  const {
    editId, editText, editRef,
    setEditId, setEditText,
    startEdit, confirmEdit, cancelEdit,
  } = useTaskEdit(updateTaskText);

  const {
    dragId, dragOverId,
    onDragStart, onDragOver, onDrop, onDragEnd,
  } = useDragAndDrop(tasks, reorderedTasks);

  return {
    tasks, visible, filter,
    input, selectedPriority, selectedCategory, listRef,
    editId, editText, editRef,
    dragId, dragOverId,
    justCompleted, removing, justAdded, completionPopup,
    total, doneCount, remaining, pct,
    highPriorityCount, mediumPriorityCount, lowPriorityCount,
    setFilter, setInput, setSelectedPriority, setSelectedCategory,
    setEditId, setEditText,
    addTask, toggleTask, removeTask,
    startEdit, confirmEdit, cancelEdit,
    onDragStart, onDragOver, onDrop, onDragEnd,
  };
}
