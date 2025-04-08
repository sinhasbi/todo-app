export interface Task {
  id: string;
  title: string;
  completed: boolean;
  reminder?: Date | null;
} 