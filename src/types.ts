export type Category = string;
export type RepeatUnit = 'day' | 'week' | 'month';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  dueDate: string;
  time: string;
  completed: boolean;
  recurring?: boolean;
  repeatEvery?: number;
  repeatUnit?: RepeatUnit;
  reminderEnabled?: boolean;
  reminderOffsetMinutes?: number;
  reminderSentAt?: string;
  streak?: number;
  impact?: number;
}

export interface UserProfile {
  name: string;
  level: string;
  focusScore: number;
  avatar: string;
}
