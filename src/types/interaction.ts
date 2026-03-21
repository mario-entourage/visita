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
  type: InteractionType;
  resultCode: number; // 1-5
  samplesDelivered: boolean;
  spokeFaceToFace: boolean;
  followUpScheduled: boolean;
  notes: string;
  location?: GeoPoint;
  doctorName?: string; // Denormalized for offline display
  repName?: string; // Denormalized
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
