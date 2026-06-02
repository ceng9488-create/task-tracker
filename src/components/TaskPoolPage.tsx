import { useState, useRef, useEffect } from "react";
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
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const hasAnyTask = !loading && tasks.length > 0;
  const isSingleTask = !loading && tasks.length === 1;

  useEffect(() => {
    if (!hasAnyTask) setShowForm(false);
  }, [hasAnyTask]);

  useEffect(() => {
    if (!showForm) return;
    function handleClickOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowForm(false);
        setInput("");
        setPriority("medium");
        setCategory("Work");
        setTimerMinutes(null);
        setRecurring("none");
        setShowMore(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  function handleAdd() {
    if (!input.trim()) return;
    addTask(input.trim(), priority, category, timerMinutes, recurring);
    setInput("");
    setPriority("medium");
    setCategory("Work");
    setTimerMinutes(null);
    setRecurring("none");
    setShowMore(false);
    setShowForm(false);
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
    <div className={[styles.page, hasAnyTask ? styles.pageCompact : ""].filter(Boolean).join(" ")}>
      {!hasAnyTask && (
        <div className={styles.header}>
          <h2 className={styles.title}>Task Pool</h2>
          <p className={styles.subtitle}>Your idea space — capture anything, schedule when ready</p>
        </div>
      )}

      {hasAnyTask && !showForm ? (
        <button className={styles.addCompactBtn} onClick={() => setShowForm(true)}>
          + Add task
        </button>
      ) : (
        <div ref={formRef} className={[styles.formCard, showOptions ? styles.formCardOpen : ""].join(" ")}>
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
      )}

      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : tasks.length === 0 ? (
        <div className={styles.instructions}>
          <p className={styles.instructionTitle}>What's on your mind?</p>
          <p className={styles.instructionDesc}>
            This is your personal idea space — no schedule, no pressure.
            Capture anything you want to do, try, or remember.
          </p>
          <div className={styles.instructionHints}>
            <span className={styles.instructionHint}>🎯 Tasks for today</span>
            <span className={styles.instructionHint}>🔁 Habits to build</span>
            <span className={styles.instructionHint}>💡 Ideas & goals</span>
          </div>
          <p className={styles.instructionFooter}>
            Pick any task and hit <strong>Do it NOW!</strong> whenever you're ready to work on it.
          </p>
        </div>
      ) : (
        <div className={styles.boardSection}>
          {!isSingleTask && (
            <p className={styles.count}>{tasks.length} tasks in pool</p>
          )}
          <div className={[
            styles.noteGrid,
            isSingleTask ? styles.noteGridSingle : styles.noteGridMulti,
          ].join(" ")}>
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
                    Do it NOW!
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
