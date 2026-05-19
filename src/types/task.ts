export type Priority = "high" | "medium" | "low";
export type Category = "Work" | "Health" | "Learning" | "Personal";
export type Filter = "All" | "Active" | "Done" | "High priority";

export interface Task {
  id: number;
  text: string;
  priority: Priority;
  category: Category;
  isDone: boolean;
}
