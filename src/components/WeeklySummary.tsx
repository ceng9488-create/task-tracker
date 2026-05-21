import { useState } from "react";
import { useWeeklySummary } from "../hooks/useWeeklySummary";
import styles from "./WeeklySummary.module.css";

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function WeeklySummary() {
  const { history, loading } = useWeeklySummary();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) return <div className={styles.loading}>Loading…</div>;

  const max = Math.max(...history.map((d) => d.total), 1);
  const selectedDay = history.find((d) => d.date === selectedDate) ?? null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>This week</h2>
      <div className={styles.chart}>
        {history.map((day) => {
          const label = new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          });
          const isSelected = day.date === selectedDate;
          return (
            <div
              key={day.date}
              className={`${styles.dayCol} ${isSelected ? styles.dayColSelected : ""}`}
              onClick={() => setSelectedDate(isSelected ? null : day.date)}
            >
              <span className={styles.count}>{day.total > 0 ? day.total : ""}</span>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ height: `${(day.total / max) * 100}%` }}>
                  {day.total > 0 && (
                    <>
                      <span className={styles.low}    style={{ flex: day.low }} />
                      <span className={styles.medium} style={{ flex: day.medium }} />
                      <span className={styles.high}   style={{ flex: day.high }} />
                    </>
                  )}
                </div>
              </div>
              <span className={styles.label}>{label}</span>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className={styles.taskPanel}>
          <div className={styles.taskPanelHeader}>
            <span className={styles.taskPanelDate}>
              {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              })}
            </span>
            <span className={styles.taskPanelCount}>{selectedDay.total} completed</span>
          </div>

          {selectedDay.tasks.length === 0 ? (
            <p className={styles.emptyDay}>No tasks completed this day.</p>
          ) : (
            <ul className={styles.taskList}>
              {selectedDay.tasks.map((task) => (
                <li key={task.id} className={styles.taskItem}>
                  <span className={styles.taskDot} data-priority={task.priority} />
                  <span className={styles.taskText}>{task.text}</span>
                  <span className={styles.taskMeta}>
                    {PRIORITY_LABEL[task.priority]} · {task.category}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
