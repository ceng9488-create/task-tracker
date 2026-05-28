import { useState } from "react";
import { useWeeklySummary } from "../hooks/useWeeklySummary";
import styles from "./WeeklySummary.module.css";
import { CircleCheckBig, CircleDashed } from "lucide-react";

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

function fmtDuration(createdAt: string | null, completedAt: string | null): string {
  if (!createdAt || !completedAt) return "—";
  const ms = new Date(completedAt).getTime() - new Date(createdAt).getTime();
  if (ms <= 0) return "—";
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
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
        <h2 className={styles.title}>Summary of the week</h2>
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
        <div className={styles.body}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <span className={styles.chartTitle}>Tasks completed per day</span>
              <div className={styles.chartLegend}>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendWork}`} />Work</span>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendHealth}`} />Health</span>
                <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.legendLearning}`} />Learning</span>
              </div>
            </div>
            <div className={styles.chart}>
              {history.map((day) => {
                const d = new Date(day.date + "T00:00:00");
                const label = `${d.toLocaleDateString("en-US", { weekday: "short" })} ${d.getDate()}`;
                const isSelected = day.date === selectedDate;
                const barH = Math.round((day.total / max) * 130);
                return (
                  <div key={day.date} className={styles.chartDay} onClick={() => setSelectedDate(day.date)}>
                    <span className={`${styles.chartCount} ${day.total > 0 ? styles.chartCountActive : ""}`}>
                      {day.total > 0 ? day.total : "0"}
                    </span>
                    {day.total === 0 ? (
                      <div className={`${styles.chartBar} ${styles.chartBarEmpty} ${isSelected ? styles.chartBarSelected : ""}`} />
                    ) : (
                      <div className={`${styles.chartBar} ${isSelected ? styles.chartBarSelected : ""}`} style={{ height: barH }}>
                        {day.health   > 0 && <div className={`${styles.chartSeg} ${styles.segHealth}`}   style={{ flex: day.health }} />}
                        {day.learning > 0 && <div className={`${styles.chartSeg} ${styles.segLearning}`} style={{ flex: day.learning }} />}
                        {day.work     > 0 && <div className={`${styles.chartSeg} ${styles.segWork}`}     style={{ flex: day.work }} />}
                        {day.personal > 0 && <div className={`${styles.chartSeg} ${styles.segPersonal}`} style={{ flex: day.personal }} />}
                      </div>
                    )}
                    <span className={`${styles.chartLabel} ${isSelected ? styles.chartLabelActive : ""}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className={styles.detail}>
              <div className={styles.detailHead}>
                <span className={styles.detailDate}>
                  {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </span>
                <span className={styles.detailMeta}>
                  {selectedDay.total} completed
                  {selectedDay.pendingTasks.length > 0 && ` · ${selectedDay.pendingTasks.length} pending`}
                </span>
              </div>
              <div className={styles.detailProgress}>
                <div
                  className={styles.detailProgressFill}
                  style={{
                    width: `${
                      selectedDay.total + selectedDay.pendingTasks.length > 0
                        ? (selectedDay.total / (selectedDay.total + selectedDay.pendingTasks.length)) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              {selectedDay.tasks.length === 0 && selectedDay.pendingTasks.length === 0 ? (
                <p className={styles.emptyDay}>No tasks for this day.</p>
              ) : (
                <>
                  {selectedDay.tasks.length > 0 && (
                    <>
                      <div className={`${styles.detailSection} ${styles.detailSectionDone}`}><CircleCheckBig size={13} />COMPLETED</div>
                      <div className={styles.detailList}>
                        {selectedDay.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`${styles.task} ${styles[`task${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)}` as "taskLow" | "taskMedium" | "taskHigh"]}`}
                          >
                            <div className={styles.taskBody}>
                              <div className={`${styles.taskTitle} ${styles.taskTitleDone}`}>{task.text}</div>
                              <div className={styles.taskTags}>
                                <span className={styles.taskPriority}>{PRIORITY_LABEL[task.priority]}</span>
                                <span className={styles.taskCategory}>{task.category}</span>
                              </div>
                            </div>
                            <div className={styles.taskTime}>
                              {fmtDuration(task.createdAt, task.completedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {selectedDay.pendingTasks.length > 0 && (
                    <>
                      <div className={`${styles.detailSection} ${styles.detailSectionPending}`}><CircleDashed size={13} />PENDING</div>
                      <div className={styles.detailList}>
                        {selectedDay.pendingTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`${styles.task} ${styles[`task${task.priority.charAt(0).toUpperCase()}${task.priority.slice(1)}` as "taskLow" | "taskMedium" | "taskHigh"]}`}
                          >
                            <div className={styles.taskBody}>
                              <div className={styles.taskTitle}>{task.text}</div>
                              <div className={styles.taskTags}>
                                <span className={styles.taskPriority}>{PRIORITY_LABEL[task.priority]}</span>
                                <span className={styles.taskCategory}>{task.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
