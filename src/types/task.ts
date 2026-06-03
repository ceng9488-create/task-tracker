export type Priority = "high" | "medium" | "low";
export type Category = "Work" | "Health" | "Learning" | "Personal";
export type Filter = "All" | "Pending" | "In Progress" | "Completed";
export type Recurring = "none" | "everyday" | "odd" | "even";

export interface Task {
  id: number;
  text: string;
  priority: Priority;
  category: Category;
  isDone: boolean;
  isInProgress: boolean;
  position: number;
  completedAt: string | null;
  createdAt: string | null;
  inPool: boolean;
  timerMinutes?: number | null;
  recurring?: Recurring;
}

export interface DayHistory {
  date: string; // YYYY-MM-DD
  total: number;
  high: number;
  medium: number;
  low: number;
  health: number;
  work: number;
  learning: number;
  personal: number;
  tasks: HistoryTask[];
  pendingTasks: HistoryTask[];
}

export interface HistoryTask {
  id: number;
  text: string;
  priority: Priority;
  category: Category;
  createdAt: string | null;
  completedAt: string | null;
}
