import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
  type DragEvent,
} from "react";
import type { Task } from "../types/task";

export function useDragAndDrop(setTasks: Dispatch<SetStateAction<Task[]>>) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const onDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, id: number) => {
      setDragId(id);
      event.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>, id: number) => {
      event.preventDefault();
      if (id !== dragId) setDragOverId(id);
    },
    [dragId],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, targetId: number) => {
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
    },
    [dragId],
  );

  const onDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  return {
    dragId,
    dragOverId,
    // actions
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
}
