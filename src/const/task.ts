import type { Priority, Category, Task } from "../types/task";

export const PRIORITY_OPTIONS: Priority[] = ["high", "medium", "low"];

export const CATEGORY_OPTIONS: Category[] = ["Work", "Health", "Learning", "Personal"];

export const FILTER_OPTIONS = ["All", "Active", "Done", "High priority"] as const;

export const ANIMATION_DURATION_MS = {
  ADD_TASK_HIGHLIGHT: 500,
  COMPLETION_CELEBRATE: 800,
  REMOVE_SLIDE_OUT: 300,
} as const;

export const INITIAL_TASKS: Task[] = [
  { id: 1, text: "Review pull request", priority: "high", category: "Work", isDone: false },
  { id: 2, text: "Go for a 30-min run", priority: "medium", category: "Health", isDone: false },
  { id: 3, text: "Read React Fiber docs", priority: "medium", category: "Learning", isDone: true },
  { id: 4, text: "Reply to recruiter email", priority: "high", category: "Work", isDone: false },
];
