import styles from "./Sidebar.module.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

interface Props {
  view: "tasks" | "history";
  onNavigate: (v: "tasks" | "history") => void;
}

export function Sidebar({ view, onNavigate }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { signOut, session } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.logoRow}>
          <span className={styles.logoIcon}>✓</span>
          <span className={styles.logoText}>Task Tracker</span>
        </div>
        <nav className={styles.nav}>
          <div
            className={`${styles.navItem} ${view === "tasks" ? styles.active : ""}`}
            onClick={() => onNavigate("tasks")}
          >
            <span className={styles.navIcon}>☰</span> Tasks
          </div>
          <div
            className={`${styles.navItem} ${view === "history" ? styles.active : ""}`}
            onClick={() => onNavigate("history")}
          >
            <span className={styles.navIcon}>📅</span> History
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        {session?.user?.email && (
          <p className={styles.email} title={session.user.email}>
            {session.user.email}
          </p>
        )}
        <button
          data-testid="theme-toggle-btn"
          onClick={toggleTheme}
          className={styles.iconButton}
        >
          {theme === "light" ? "☀ Light" : "☾ Dark"}
        </button>
        <button
          data-testid="signout-btn"
          onClick={signOut}
          className={styles.signOutButton}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
