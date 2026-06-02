import "./App.css";
import { useState, useEffect } from "react";
import { useTaskManager } from "./hooks/useTaskManager";
import { StatsGrid } from "./components/StatsGrid";
import { FilterBar } from "./components/FilterBar";
import { TaskList } from "./components/TaskList";
import { Sidebar } from "./components/Sidebar";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext";
import { WeeklySummary } from "./components/WeeklySummary";
import { CompletionPopup } from "./components/CompletionPopup";
import { PomodoroPage } from "./components/PomodoroPage";
import { TaskPoolPage } from "./components/TaskPoolPage";


const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL as string | undefined;
const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD as string | undefined;

function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(DEV_EMAIL ?? "");
  const [password, setPassword] = useState(DEV_PASSWORD ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    if (mode === "signin") {
      const err = await signInWithEmail(email, password);
      if (err) setError(err);
    } else {
      const err = await signUpWithEmail(email, password);
      if (err) setError(err);
      else setMessage("Check your email to confirm your account.");
    }
    setLoading(false);
  }

  return (
    <div className={styles.loginPage}>
      <h1 className={styles.title}>Task tracker</h1>
      <p className={styles.subtitle}>
        {mode === "signin" ? "Sign in to your account" : "Create a new account"}
      </p>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="email"
          data-testid="email-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.authInput}
          required
        />
        <input
          type="password"
          data-testid="password-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
          required
        />
        {error && <p className={styles.authError}>{error}</p>}
        {message && <p className={styles.authMessage}>{message}</p>}
        <button type="submit" data-testid="auth-submit-btn" className={styles.authButton} disabled={loading}>
          {loading ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <div className={styles.authDivider}><span>or</span></div>

      {DEV_EMAIL && (
        <button
          type="button"
          className={styles.devButton}
          onClick={async () => {
            setLoading(true);
            setError(null);
            const err = await signInWithEmail(DEV_EMAIL, DEV_PASSWORD!);
            if (err) setError(err);
            setLoading(false);
          }}
          disabled={loading}
        >
          Dev Login ({DEV_EMAIL})
        </button>
      )}

      <button onClick={signInWithGoogle} data-testid="google-signin-btn" className={styles.googleButton}>
        Continue with Google
      </button>

      <p className={styles.authSwitch}>
        {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          data-testid="auth-mode-toggle-btn"
          className={styles.authSwitchLink}
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function TaskTrackerApp({ onNavigate }: { onNavigate: (view: "tasks" | "history" | "pomodoro" | "pool") => void }) {
  const {
    tasks,
    visible,
    filter,
    editId,
    editText,
    dragId,
    dragOverId,
    justCompleted,
    removing,
    justAdded,
    completionPopup,
    editRef,
    listRef,
    total,
    doneCount,
    remaining,
    pct,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    setFilter,
    setEditText,
    toggleTask,
    removeTask,
    startEdit,
    confirmEdit,
    cancelEdit,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  } = useTaskManager();

  const { session } = useAuth();
  const username = session?.user?.user_metadata?.full_name
    ?? session?.user?.user_metadata?.name
    ?? session?.user?.email?.split('@')[0]
    ?? 'there';

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

  const hour = now.getHours();
  const scene = hour >= 5 && hour < 12 ? "morning"
    : hour >= 12 && hour < 17 ? "afternoon"
    : hour >= 17 && hour < 20 ? "evening"
    : "night";
  const greeting = `Good ${scene}`;

  const summaryPriority = highPriorityCount > 0 ? 'high'
    : mediumPriorityCount > 0 ? 'medium'
    : lowPriorityCount > 0 ? 'low'
    : null;
  const summaryLine = summaryPriority === 'high' ? `${highPriorityCount} high priority`
    : summaryPriority === 'medium' ? `${mediumPriorityCount} medium priority`
    : summaryPriority === 'low' ? `${lowPriorityCount} low priority`
    : null;

  const hasActiveTasks = tasks.length > 0;

  return (
    <div className={styles.app}>
      {!hasActiveTasks ? (
        <div className={styles.heroSection}>
          <p className={styles.heroEyebrow}>{weekday}, {day} {month}</p>
          <h1 className={styles.heroGreeting}>{greeting}, {username}</h1>
          <p className={styles.heroSubtitle}>Anything to do today?</p>
          <button className={styles.heroCta} onClick={() => onNavigate("pool")}>
            Get from Task Pool →
          </button>
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.dateDisplay} data-scene={scene}>
              <div className={styles.dateLeft}>
                <span className={styles.dateMain}>{weekday}, {day} {month}</span>
                <span className={styles.dateGreeting}>{greeting}, {username}</span>
              </div>
              {summaryLine && (
                <div className={styles.dateSummary}>
                  <span className={styles.dateSummaryDot} data-priority={summaryPriority} />
                  <span className={styles.dateSummaryCount}>{summaryLine}</span>
                </div>
              )}
            </div>
          </div>

          <StatsGrid
            total={total}
            doneCount={doneCount}
            remaining={remaining}
            pct={pct}
          />

          <FilterBar activeFilter={filter} onFilterChange={setFilter} />

          <TaskList
            visible={visible}
            activeFilter={filter}
            listRef={listRef}
            editId={editId}
            editText={editText}
            editRef={editRef}
            onEditStart={startEdit}
            onEditConfirm={confirmEdit}
            onEditTextChange={setEditText}
            onEditCancel={cancelEdit}
            onToggle={toggleTask}
            onRemove={removeTask}
            dragId={dragId}
            dragOverId={dragOverId}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            removing={removing}
            justAdded={justAdded}
            justCompleted={justCompleted}
          />

          <div className={styles.hint}>
            
            <span className={styles.hintKey}>Double-click</span> to edit
            <span className={styles.hintDivider}>·</span>
            <span className={styles.hintKey}>Drag</span> to reorder
          </div>
        </>
      )}

      <CompletionPopup popup={completionPopup} />
    </div>
  );
}
function App() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<"tasks" | "history" | "pomodoro" | "pool">("tasks");

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!session) return <LoginPage />;
  return (
    <div className={styles.layout}>
      <Sidebar view={view} onNavigate={setView} />
      <div className={styles.main}>
        {view === "tasks" ? <TaskTrackerApp onNavigate={setView} />
          : view === "pool" ? <TaskPoolPage />
          : view === "pomodoro" ? <PomodoroPage />
          : <WeeklySummary />}
      </div>
    </div>
  );
}

export default App;
