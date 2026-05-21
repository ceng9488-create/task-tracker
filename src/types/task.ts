export type Priority = "high" | "medium" | "low";
export type Category = "Work" | "Health" | "Learning" | "Personal";
export type Filter = "All" | "Active" | "Done" | "High priority";

export interface Task {
  id: number;
  text: string;
  priority: Priority;
  category: Category;
  isDone: boolean;
  position: number;
  completedAt: string | null;
}

export interface DayHistory {
  date: string; // YYYY-MM-DD
  total: number;
  high: number;
  medium: number;
  low: number;
  tasks: HistoryTask[];
}

export interface HistoryTask {
  id: number;
  text: string;
  priority: Priority;
  category: Category;
  completedAt: string;
}
