import { Timestamp } from 'firebase/firestore';

export type ActionItemType =
  | 'address_change'
  | 'hostile_flag'
  | 'crm_update'
  | 'follow_up'
  | 'other';

export type ActionItemStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'dismissed';

export interface ActionItem {
  id: string;
  triggeringInteractionId?: string;
  doctorId: string;
  issueType: ActionItemType;
  status: ActionItemStatus;
  description: string;
  assignedTo?: string; // userId
  resolvedBy?: string; // userId
  resolvedAt?: Timestamp;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
