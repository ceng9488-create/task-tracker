import type { ReactElement, DragEvent, RefObject } from "react";
import type { Task } from "../types/task";
import styles from "./TaskItem.module.css";

interface Props {
  task: Task;

  // edit state
  isEditing: boolean;
  editText: string;
  editRef: RefObject<HTMLInputElement | null>;
  onEditStart: (task: Task) => void;
  onEditConfirm: () => void;
  onEditTextChange: (value: string) => void;
  onEditCancel: () => void;

  // toggle & remove
  onToggle: (taskId: number) => void;
  onRemove: (taskId: number) => void;

  // drag state
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDrop: (event: DragEvent<HTMLDivElement>, taskId: number) => void;
  onDragEnd: () => void;

  // animation flags
  isRemoving: boolean;
  isJustAdded: boolean;
  isJustCompleted: boolean;
}

export function TaskItem({
  task,
  isEditing, editText, editRef,
  onEditStart, onEditConfirm, onEditTextChange, onEditCancel,
  onToggle, onRemove,
  isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
  isRemoving, isJustAdded, isJustCompleted,
}: Props): ReactElement {
  const containerClass = [
    styles.container,
    isEditing        && styles.editing,
    isDragging       && styles.isDragging,
    isDragOver       && styles.isDragOver,
    isRemoving       && styles.isRemoving,
    task.isDone      && styles.done,
    task.isInProgress && styles.inProgress,
    isJustAdded      && styles.isJustAdded,
    isJustCompleted  && styles.isJustCompleted,
  ].filter(Boolean).join(" ");

  return (
    <div
      data-testid={`task-item-${task.id}`}
      draggable={!isEditing}
      onDragStart={(event) => onDragStart(event, task.id)}
      onDragOver={(event) => onDragOver(event, task.id)}
      onDrop={(event) => onDrop(event, task.id)}
      onDragEnd={onDragEnd}
      className={containerClass}
    >
      <div className={styles.dragHandle}>⠿</div>

      <div
        data-testid={`toggle-task-btn-${task.id}`}
        onClick={() => { if (!task.isDone) onToggle(task.id); }}
        className={[
          styles.checkbox,
          task.isDone       && styles.done,
          task.isDone       && styles.locked,
          task.isInProgress && styles.inProgress,
          isJustCompleted   && styles.completing,
        ].filter(Boolean).join(" ")}
      >
        {task.isDone      && <span className={styles.checkmark}>✓</span>}
        {task.isInProgress && <span className={styles.progressMark}>▶</span>}
      </div>

      {isEditing ? (
        <input
          ref={editRef}
          type="text"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditConfirm();
            if (e.key === "Escape") onEditCancel();
          }}
          onBlur={onEditConfirm}
          className={styles.editInput}
        />
      ) : (
        <span
          onDoubleClick={() => { if (!task.isDone) onEditStart(task); }}
          className={[styles.taskText, task.isDone ? styles.done : task.isInProgress ? styles.inProgress : ""].filter(Boolean).join(" ")}
          title={task.isDone ? "Completed" : "Double-click to edit"}
        >
          {task.text}
        </span>
      )}

      <span className={styles.categoryBadge}>{task.category}</span>

      <div
        className={[
          styles.priorityDot,
          styles[task.priority],
        ].filter(Boolean).join(" ")}
      />

      <button
        data-testid={`remove-task-btn-${task.id}`}
        onClick={() => onRemove(task.id)}
        className={styles.removeButton}
      >
        ✕
      </button>
    </div>
  );
}
