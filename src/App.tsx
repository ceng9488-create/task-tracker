import "./App.css";
import { useState, useEffect } from "react";
import { useTaskManager } from "./hooks/useTaskManager";
import { StatsGrid } from "./components/StatsGrid";
import { AddTaskForm } from "./components/AddTaskForm";
import { FilterBar } from "./components/FilterBar";
import { TaskList } from "./components/TaskList";
import { DailySummary } from "./components/DailySummary";
import { Sidebar } from "./components/Sidebar";
import styles from "./App.module.css";
import { useAuth } from "./context/AuthContext";


function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

function TaskTrackerApp() {
  const {
    tasks,
    visible,
    filter,
    input,
    selectedPriority,
    selectedCategory,
    editId,
    editText,
    dragId,
    dragOverId,
    justCompleted,
    removing,
    justAdded,
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
    setInput,
    setSelectedPriority,
    setSelectedCategory,
    setEditText,
    addTask,
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

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day = now.getDate();
  const ordinal = (() => { const s = ["th","st","nd","rd"]; const v = day % 100; return day + (s[(v-20)%10] || s[v] || s[0]); })();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.dateDisplay}>
          <div className={styles.dateGroup}>
            <span className={styles.dateDay}>{ordinal}</span>
            <span className={styles.dateMonth}>{month}</span>
          </div>
          <div className={styles.dateSeparator} />
          <div className={styles.dateGroup}>
            <span className={styles.dateDay}>{weekday}</span>
            <span className={styles.dateMonth}>{time}</span>
          </div>
        </div>
      </div>

      <DailySummary
        highPriorityCount={highPriorityCount}
        mediumPriorityCount={mediumPriorityCount}
        lowPriorityCount={lowPriorityCount}
        remaining={remaining}
      />

      <StatsGrid
        total={total}
        doneCount={doneCount}
        remaining={remaining}
        pct={pct}
      />

      <AddTaskForm
        input={input}
        setInput={setInput}
        addTask={addTask}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
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

      {tasks.length > 0 && (
        <div className={styles.hint}>
          <span className={styles.hintKey}>Enter</span> to add
          <span className={styles.hintDivider}>·</span>
          <span className={styles.hintKey}>Double-click</span> to edit
          <span className={styles.hintDivider}>·</span>
          <span className={styles.hintKey}>Drag</span> to reorder
        </div>
      )}
    </div>
  );
}
function App() {
  const { session, loading } = useAuth();
  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!session) return <LoginPage />;
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TaskTrackerApp />
      </div>
    </div>
  );
}

export default App;
