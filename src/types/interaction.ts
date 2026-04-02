import { Timestamp, GeoPoint } from 'firebase/firestore';

export type InteractionType =
  | 'field_visit'
  | 'clinical_event'
  | 'congress'
  | 'digital';

export interface Interaction {
  id: string;
  doctorId: string;
  repId: string;
  resultCode: number; // 1-5
  preVisitNotes?: string;  // Written before entering the office
  postVisitNotes?: string; // Written after leaving
  location?: GeoPoint;
  doctorName?: string; // Denormalized for offline display
  repName?: string;   // Denormalized
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Extended detail fields — optional, shown in expanded section
  isPrescriber?: boolean;
  prescribedProducts?: string;
  prescriptionType?: 'rdc660' | 'pharmacy';
  reasonTherapeutic?: boolean;
  reasonDelivery?: boolean;
  reasonPracticality?: boolean;
  reasonCost?: boolean;
  reasonOther?: string;
  // Legacy fields — kept for backward compat with older records
  type?: InteractionType;
  samplesDelivered?: boolean;
  spokeFaceToFace?: boolean;
  followUpScheduled?: boolean;
  notes?: string;
}
