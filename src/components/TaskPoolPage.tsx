import { useState, useRef } from "react";
import type { ReactElement } from "react";
import { useTaskPool } from "../hooks/useTaskPool";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../const/task";
import type { Category, Priority, Recurring } from "../types/task";
import styles from "./TaskPoolPage.module.css";

const TIMER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "none" },
  { value: 15, label: "15m" },
  { value: 25, label: "25m" },
  { value: 45, label: "45m" },
  { value: 60, label: "1h" },
];

const RECURRING_OPTIONS: { value: Recurring; label: string }[] = [
  { value: "none", label: "none" },
  { value: "everyday", label: "everyday" },
  { value: "odd", label: "odd days" },
  { value: "even", label: "even days" },
];

export function TaskPoolPage(): ReactElement {
  const { tasks, loading, addTask, removeTask, scheduleForToday, updateTaskText } = useTaskPool();
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("Work");
  const [focused, setFocused] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLInputElement | null>(null);

  const [showMore, setShowMore] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [recurring, setRecurring] = useState<Recurring>("none");

  function handleAdd() {
    if (!input.trim()) return;
    addTask(input.trim(), priority, category, timerMinutes, recurring);
    setInput("");
    setPriority("medium");
    setCategory("Work");
    setTimerMinutes(null);
    setRecurring("none");
    setShowMore(false);
  }

  function startEdit(id: number, text: string) {
    setEditId(id);
    setEditText(text);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function confirmEdit() {
    if (editId !== null && editText.trim()) {
      updateTaskText(editId, editText.trim());
    }
    setEditId(null);
  }

  const showOptions = focused || input.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Task Pool</h2>
        <p className={styles.subtitle}>Backlog of tasks to schedule when ready</p>
      </div>

      <div className={[styles.formCard, showOptions ? styles.formCardOpen : ""].join(" ")}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setShowMore(false); }}
          placeholder="Add a task to the pool..."
          className={styles.textInput}
        />

        <div className={[styles.formOptions, showOptions ? styles.formOptionsVisible : ""].join(" ")}>
          <div className={styles.chipGroup}>
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p}
                onMouseDown={(e) => { e.preventDefault(); setPriority(p); }}
                className={[styles.chip, styles[`p_${p}`], priority === p ? styles.chipSelected : ""].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>

          <div className={styles.chipDivider} />

          <div className={styles.chipGroup}>
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                onMouseDown={(e) => { e.preventDefault(); setCategory(c); }}
                className={[styles.chip, category === c ? styles.chipSelected : ""].join(" ")}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onMouseDown={(e) => { e.preventDefault(); handleAdd(); }}
            className={styles.addButton}
          >
            + Add
          </button>

          <button
            className={styles.moreToggle}
            onMouseDown={(e) => { e.preventDefault(); setShowMore((v) => !v); }}
          >
            {showMore ? "▴ less" : "▾ more options"}
          </button>
        </div>

        <div className={[styles.morePanel, showOptions && showMore ? styles.morePanelVisible : ""].join(" ")}>
          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Timer</span>
            <div className={styles.chipGroup}>
              {TIMER_OPTIONS.map(({ value, label }) => (
                <button
                  key={label}
                  onMouseDown={(e) => { e.preventDefault(); setTimerMinutes(value); }}
                  className={[styles.chip, timerMinutes === value ? styles.chipSelected : ""].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.optionRow}>
            <span className={styles.optionLabel}>Repeat</span>
            <div className={styles.chipGroup}>
              {RECURRING_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onMouseDown={(e) => { e.preventDefault(); setRecurring(value); }}
                  className={[styles.chip, recurring === value ? styles.chipSelected : ""].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>📋</p>
          <p className={styles.emptyText}>Your pool is empty</p>
          <p className={styles.emptyHint}>Add tasks here to store them for later</p>
        </div>
      ) : (
        <div className={styles.boardSection}>
          <p className={styles.count}>{tasks.length} task{tasks.length !== 1 ? "s" : ""} in pool</p>
          <div className={styles.noteGrid}>
            {tasks.map((task) => (
              <div key={task.id} className={[styles.note, styles[task.priority]].join(" ")}>
                <div className={styles.noteTop}>
                  <span className={styles.noteCat}>{task.category}</span>
                  <button className={styles.noteRemove} onClick={() => removeTask(task.id)}>✕</button>
                </div>

                <div className={styles.noteBody}>
                  {editId === task.id ? (
                    <input
                      ref={editRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit();
                        if (e.key === "Escape") setEditId(null);
                      }}
                      onBlur={confirmEdit}
                      className={styles.noteEditInput}
                    />
                  ) : (
                    <span
                      className={styles.noteText}
                      onDoubleClick={() => startEdit(task.id, task.text)}
                      title="Double-click to edit"
                    >
                      {task.text}
                    </span>
                  )}
                </div>

                {(task.timerMinutes != null || (task.recurring && task.recurring !== "none")) && (
                  <div className={styles.noteMeta}>
                    {task.timerMinutes != null && (
                      <span className={styles.noteTag}>⏱ {task.timerMinutes < 60 ? `${task.timerMinutes}m` : "1h"}</span>
                    )}
                    {task.recurring && task.recurring !== "none" && (
                      <span className={styles.noteTag}>↺ {task.recurring}</span>
                    )}
                  </div>
                )}

                <div className={styles.noteFooter}>
                  <button className={styles.noteSchedule} onClick={() => scheduleForToday(task.id)}>
                    + Today
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
