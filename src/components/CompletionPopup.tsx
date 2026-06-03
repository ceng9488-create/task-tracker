import type { CompletionPopup as CompletionPopupType } from "../hooks/useTasks";
import styles from "./CompletionPopup.module.css";

interface Props {
  popup: CompletionPopupType | null;
}

export function CompletionPopup({ popup }: Props) {
  if (!popup) return null;

  const isStarted = popup.type === "started";

  return (
    <div className={[styles.popup, isStarted ? styles.popupStarted : styles.popupCompleted].join(" ")}>
      <span className={styles.icon}>{isStarted ? "▶" : "✓"}</span>
      <div className={styles.body}>
        <span className={styles.label}>{isStarted ? "In Progress" : "Completed in"}</span>
        {!isStarted && popup.elapsed && (
          <span className={styles.elapsed}>{popup.elapsed}</span>
        )}
      </div>
      <span className={styles.task}>{popup.taskText}</span>
    </div>
  );
}
