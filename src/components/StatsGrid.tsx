import type { ReactElement } from "react";
import styles from "./StatsGrid.module.css";

interface Props {
  total: number;
  doneCount: number;
  remaining: number;
  pct: number;
}

export function StatsGrid({ total, doneCount, remaining, pct }: Props): ReactElement {
  const stats = [
    { label: "Total",      value: total },
    { label: "Done",       value: doneCount },
    { label: "Remaining",  value: remaining },
    { label: "Completion", value: `${pct}%` },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.card}>
          <div className={styles.cardLabel}>{stat.label}</div>
          <div className={styles.cardValue}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
