import { Timestamp } from 'firebase/firestore';

export interface WeeklyGoal {
  id: string;
  repId: string;
  weekStart: Timestamp; // Monday 00:00 of the goal week
  target: number;
  setBy: string; // manager userId
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
