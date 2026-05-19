import type { ReactElement } from "react";
import styles from "./ProgressBar.module.css";

interface Props {
  percentage: number;
}

export function ProgressBar({ percentage }: Props): ReactElement {
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${percentage}%` }} />
    </div>
  );
}
