import { useEffect, useState } from 'react';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/db';
import styles from './PomodoroTimer.module.css';

interface ActiveTask { id: number; text: string; }

const CIRCUMFERENCE = 2 * Math.PI * 40;

export function PomodoroTimer() {
  const { mode, display, progress, running, selectedTaskId, setSelectedTaskId, toggle, reset } = usePomodoroTimer();
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Pomodoro</span>
        <span className={`${styles.modeBadge} ${styles[mode]}`}>
          {mode === 'work' ? 'Work' : 'Break'}
        </span>
      </div>

      <div className={styles.ring}>
        <svg viewBox="0 0 100 100" className={styles.svg}>
          <circle cx="50" cy="50" r="40" className={styles.track} />
          <circle
            cx="50" cy="50" r="40"
            className={`${styles.arc} ${styles[mode]}`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <span className={styles.display}>{display}</span>
      </div>

      <div className={styles.controls}>
        <button onClick={toggle} className={`${styles.btn} ${styles.primary} ${styles[mode]}`}>
          {running ? '⏸' : '▶'}
        </button>
        <button onClick={reset} className={styles.btn} title="Reset">↺</button>
      </div>

      {tasks.length > 0 && (
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
      )}
    </div>
  );
}
