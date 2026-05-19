import type { ReactElement } from "react";
import type { Filter } from "../types/task";
import { FILTER_OPTIONS } from "../const/task";
import styles from "./FilterBar.module.css";

interface Props {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export function FilterBar({ activeFilter, onFilterChange }: Props): ReactElement {
  return (
    <div className={styles.container}>
      {FILTER_OPTIONS.map((filterOption) => (
        <button
          key={filterOption}
          onClick={() => onFilterChange(filterOption)}
          className={`${styles.button} ${activeFilter === filterOption ? styles.active : ""}`}
        >
          {filterOption}
        </button>
      ))}
    </div>
  );
}
