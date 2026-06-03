import type { Priority, Category } from "../types/task";

export const PRIORITY_OPTIONS: Priority[] = ["high", "medium", "low"];

export const CATEGORY_OPTIONS: Category[] = ["Work", "Health", "Learning", "Personal"];

export const FILTER_OPTIONS = ["All", "Pending", "In Progress", "Completed"] as const;

export const ANIMATION_DURATION_MS = {
  ADD_TASK_HIGHLIGHT: 500,
  COMPLETION_CELEBRATE: 800,
  REMOVE_SLIDE_OUT: 300,
} as const;

