import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'work' | 'break';

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  break: 5 * 60,
};

export function usePomodoroTimer() {
  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const modeRef = useRef<Mode>('work');

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const playAlert = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch { /* AudioContext unavailable */ }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeout(() => {
            setRunning(false);
            playAlert();
            const next: Mode = modeRef.current === 'work' ? 'break' : 'work';
            if (modeRef.current === 'work') setSessions(s => s + 1);
            setMode(next);
            setSecondsLeft(DURATIONS[next]);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, playAlert]);

  const toggle = useCallback(() => setRunning(r => !r), []);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(DURATIONS[modeRef.current]);
  }, []);

  const progress = 1 - secondsLeft / DURATIONS[mode];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { mode, display, progress, running, sessions, selectedTaskId, setSelectedTaskId, toggle, reset };
}
