import type { CompletionPopup as CompletionPopupType } from "../hooks/useTasks";
import styles from "./CompletionPopup.module.css";

interface Props {
  popup: CompletionPopupType | null;
}

export function CompletionPopup({ popup }: Props) {
  if (!popup) return null;
  return (
    <div className={styles.popup}>
      <span className={styles.check}>✓</span>
      <div className={styles.body}>
        <span className={styles.label}>Completed in</span>
        <span className={styles.elapsed}>{popup.elapsed}</span>
      </div>
      <span className={styles.task}>{popup.taskText}</span>
    </div>
  );
}
