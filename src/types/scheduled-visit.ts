import { Timestamp } from 'firebase/firestore';

export type VisitStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type VisitSource = 'manual' | 'google_sync' | 'manager_assigned';

export interface ScheduledVisit {
  id: string;
  doctorId: string;
  repId: string;
  scheduledFor: Timestamp;
  assignedBy: string; // userId of manager or self
  status: VisitStatus;
  notes?: string;
  completedInteractionId?: string; // Links to interaction when completed
  doctorName?: string; // Denormalized
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  googleCalendarEventId?: string; // Links back to Google Calendar event
  source?: VisitSource;
}
