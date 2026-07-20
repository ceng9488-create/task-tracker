import { useEffect, useState } from 'react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';
import styles from './PomodoroPage.module.css';

interface ActiveTask { id: number; text: string; }

const CIRCUMFERENCE = 2 * Math.PI * 72;

export function PomodoroPage() {
  const { mode, display, progress, running, sessions, selectedTaskId, setSelectedTaskId, toggle, reset } = usePomodoroTimer();
  const { session } = useAuth();
  const [tasks, setTasks] = useState<ActiveTask[]>([]);

  useEffect(() => {
    if (!session) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    db()
      .from('tasks')
      .select('id, text')
      .eq('is_done', false)
      .gte('created_at', todayStart.toISOString())
      .order('position', { ascending: true })
      .then(({ data }) => setTasks(data ?? []));
  }, [session]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.topRow}>
          <h1 className={styles.heading}>Pomodoro</h1>
          <span className={`${styles.modeBadge} ${styles[mode]}`}>
            {mode === 'work' ? 'Work' : 'Break'}
          </span>
        </div>

        <div className={styles.ring}>
          <svg viewBox="0 0 160 160" className={styles.svg}>
            <circle cx="80" cy="80" r="72" className={styles.track} />
            <circle
              cx="80" cy="80" r="72"
              className={`${styles.arc} ${styles[mode]}`}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            />
          </svg>
          <div className={styles.ringInner}>
            <span className={styles.display}>{display}</span>
            <span className={styles.modeLabel}>{mode === 'work' ? 'Focus time' : 'Take a break'}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button onClick={reset} className={styles.btnSecondary} title="Reset">↺</button>
          <button onClick={toggle} className={`${styles.btnPrimary} ${styles[mode]}`}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <div className={styles.spacer} />
        </div>

        {sessions > 0 && (
          <div className={styles.sessions}>
            <span className={styles.sessionsLabel}>Today</span>
            <div className={styles.sessionDots}>
              {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                <span key={i} className={`${styles.dot} ${styles.dotFilled}`} />
              ))}
            </div>
            <span className={styles.sessionsCount}>{sessions} {sessions === 1 ? 'session' : 'sessions'}</span>
          </div>
        )}

        <div className={styles.taskRow}>
          <span className={styles.taskLabel}>Working on</span>
          <select
            value={selectedTaskId ?? ''}
            onChange={e => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
            className={styles.taskSelect}
          >
            <option value=''>— pick a task —</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.text}</option>
            ))}
          </select>
          {selectedTask && (
            <p className={styles.selectedTask}>{selectedTask.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
