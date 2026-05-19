import type { ReactElement } from "react";
import type { Category, Priority } from "../types/task";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../const/task";
import styles from "./AddTaskForm.module.css";

interface Props {
  input: string;
  setInput: (value: string) => void;
  addTask: () => void;
  selectedPriority: Priority;
  setSelectedPriority: (value: Priority) => void;
  selectedCategory: Category;
  setSelectedCategory: (value: Category) => void;
}

export function AddTaskForm({
  input, setInput, addTask,
  selectedPriority, setSelectedPriority,
  selectedCategory, setSelectedCategory,
}: Props): ReactElement {
  return (
    <div className={styles.form}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        placeholder="What needs to be done?"
        className={styles.textInput}
      />
      <select
        value={selectedPriority}
        onChange={(e) => setSelectedPriority(e.target.value as Priority)}
        className={styles.select}
      >
        {PRIORITY_OPTIONS.map((priority) => (
          <option key={priority} value={priority}>{priority}</option>
        ))}
      </select>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value as Category)}
        className={styles.select}
      >
        {CATEGORY_OPTIONS.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <button onClick={addTask} className={styles.addButton}>
        + Add
      </button>
    </div>
  );
}
