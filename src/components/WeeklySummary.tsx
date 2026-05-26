import { useState } from "react";
import { useWeeklySummary } from "../hooks/useWeeklySummary";
import styles from "./WeeklySummary.module.css";

const TZ = "Asia/Singapore";

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function todaySGT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

function defaultDateForOffset(offset: number): string {
  const today = new Date(todaySGT() + "T00:00:00");
  today.setDate(today.getDate() + offset * 7);
  return today.toISOString().slice(0, 10);
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtWeekRange(history: { date: string }[]) {
  if (history.length < 7) return "";
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
  return `${fmt(history[0].date)} – ${fmt(history[6].date)}`;
}

export function WeeklySummary() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { history, loading } = useWeeklySummary(weekOffset);
  const [selectedDate, setSelectedDate] = useState<string | null>(todaySGT());

  const max = Math.max(...history.map((d) => d.total), 1);
  const selectedDay = history.find((d) => d.date === selectedDate) ?? null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>This week</h2>
        <div className={styles.nav}>
          <button
            className={styles.navBtn}
            onClick={() => {
              const next = weekOffset - 1;
              setWeekOffset(next);
              setSelectedDate(defaultDateForOffset(next));
            }}
          >
            ←
          </button>
          <span className={styles.weekRange}>
            {loading ? "…" : fmtWeekRange(history)}
          </span>
          <button
            className={styles.navBtn}
            onClick={() => {
              const next = weekOffset + 1;
              setWeekOffset(next);
              setSelectedDate(defaultDateForOffset(next));
            }}
            disabled={weekOffset >= 0}
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <>
          <div className={styles.chartCard}>
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
                    <span className={styles.count}>{day.total > 0 ? day.total : "–"}</span>
                    <div className={`${styles.barWrap} ${isSelected && day.total === 0 ? styles.barWrapSelected : ""}`}>
                      <div
                        className={`${styles.bar} ${day.total === 0 ? styles.barEmpty : ""}`}
                        style={{ height: `${(day.total / max) * 100}%` }}
                      >
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
                      <div className={styles.taskBody}>
                        <span className={styles.taskText}>{task.text}</span>
                        <span className={styles.taskMeta}>
                          {PRIORITY_LABEL[task.priority]} · {task.category}
                        </span>
                      </div>
                      <div className={styles.taskTimes}>
                        {task.createdAt && (
                          <span className={styles.taskTime}>
                            <span className={styles.taskTimeLabel}>Added</span>
                            {fmtTime(task.createdAt)}
                          </span>
                        )}
                        <span className={styles.taskTime}>
                          <span className={styles.taskTimeLabel}>Done</span>
                          {fmtTime(task.completedAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
