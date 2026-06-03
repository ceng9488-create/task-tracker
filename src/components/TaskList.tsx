import type { ReactElement, RefObject, DragEvent } from "react";
import type { Filter, Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import styles from "./TaskList.module.css";

interface Props {
  visible: Task[];
  activeFilter: Filter;
  listRef: RefObject<HTMLDivElement | null>;

  // edit state
  editId: number | null;
  editText: string;
  editRef: RefObject<HTMLInputElement | null>;
  onEditStart: (task: Task) => void;
  onEditConfirm: () => void;
  onEditTextChange: (value: string) => void;
  onEditCancel: () => void;

  // actions
  onToggle: (taskId: number) => void;
  onRemove: (taskId: number) => void;
  dragId: number | null;
  dragOverId: number | null;
  onDragStart: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDragEnd: () => void;
  removing: number | null;
  justAdded: number | null;
  justCompleted: number | null;
  justStarted: number | null;
}

export function TaskList({
  visible, activeFilter, listRef,
  editId, editText, editRef,
  onEditStart, onEditConfirm, onEditTextChange, onEditCancel,
  onToggle, onRemove,
  dragId, dragOverId, onDragStart, onDragOver, onDrop, onDragEnd,
  removing, justAdded, justCompleted, justStarted,
}: Props): ReactElement {
  return (
    <div ref={listRef} className={styles.list}>
      {visible.length === 0 && (
        <div className={styles.empty}>
          {activeFilter === "Completed"
            ? "Nothing completed yet — keep going!"
              : activeFilter === "Pending"
                ? "All done for today!"
                : activeFilter === "In Progress"
                  ? "Nothing in progress right now"
                  : "No tasks here — time to add some!"}
        </div>
      )}
      {visible.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editId === task.id}
          editText={editText}
          editRef={editRef}
          onEditStart={onEditStart}
          onEditConfirm={onEditConfirm}
          onEditTextChange={onEditTextChange}
          onEditCancel={onEditCancel}
          onToggle={onToggle}
          onRemove={onRemove}
          isDragging={dragId === task.id}
          isDragOver={dragOverId === task.id}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          isRemoving={removing === task.id}
          isJustAdded={justAdded === task.id}
          isJustCompleted={justCompleted === task.id}
          isJustStarted={justStarted === task.id}
        />
      ))}
    </div>
  );
}
