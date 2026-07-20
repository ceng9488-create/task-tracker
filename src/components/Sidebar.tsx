import styles from "./Sidebar.module.css";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { ListChecks, Hourglass, LayoutDashboard, Archive } from "lucide-react";

interface Props {
  view: "tasks" | "history" | "pomodoro" | "pool";
  onNavigate: (v: "tasks" | "history" | "pomodoro" | "pool") => void;
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
            <ListChecks size={16} className={styles.navIcon} /> Tasks
          </div>
          <div
            className={`${styles.navItem} ${view === "pool" ? styles.active : ""}`}
            onClick={() => onNavigate("pool")}
          >
            <Archive size={16} className={styles.navIcon} /> Task Pool
          </div>
          {/* <div
            className={`${styles.navItem} ${view === "pomodoro" ? styles.active : ""}`}
            onClick={() => onNavigate("pomodoro")}
          >
            <Hourglass size={16} className={styles.navIcon} /> Pomodoro
          </div> */}
          <div
            className={`${styles.navItem} ${view === "history" ? styles.active : ""}`}
            onClick={() => onNavigate("history")}
          >
            <LayoutDashboard size={16} className={styles.navIcon} /> Summary
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
