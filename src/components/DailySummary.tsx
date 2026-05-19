import type { ReactElement } from "react";
import styles from "./DailySummary.module.css";

interface Props {
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  remaining: number;
}

export function DailySummary({
  highPriorityCount,
  mediumPriorityCount,
  lowPriorityCount,
  remaining,
}: Props): ReactElement {
  if (remaining === 0) {
    return (
      <div className={styles.summary}>
        <span className={styles.allDone}>
          All done for today — great work!
        </span>
      </div>
    );
  }

  const parts: ReactElement[] = [];

  if (highPriorityCount > 0) {
    parts.push(
      <span key="high" className={styles.high}>
        {highPriorityCount} high
      </span>
    );
  }
  if (mediumPriorityCount > 0) {
    parts.push(
      <span key="medium" className={styles.medium}>
        {mediumPriorityCount} medium
      </span>
    );
  }
  if (lowPriorityCount > 0) {
    parts.push(
      <span key="low" className={styles.low}>
        {lowPriorityCount} low
      </span>
    );
  }

  return (
    <div className={styles.summary}>
      Hey, today you have{" "}
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? ", " : " "}
        </span>
      ))}
      priority {remaining === 1 ? "task" : "tasks"} remaining.
    </div>
  );
}
