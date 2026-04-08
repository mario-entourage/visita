import { Timestamp } from 'firebase/firestore';

export interface Doctor {
  id: string;
  firstName: string;
  lastName?: string;
  fullName: string;
  email?: string;
  crm: string;
  mainSpecialty?: string;
  /** UF do estado onde o médico é registrado (ex: "SP") */
  state?: string;
  /** Município do prescritor */
  city?: string;
  /** Telefone fixo do consultório */
  phone?: string;
  /** Celular do prescritor */
  mobilePhone?: string;
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  removedAt?: Timestamp;

  // CRM augmentation fields (written by CRM, ignored by Sales Integration)
  propensityScore?: number; // 1-5
  lastInteractionAt?: Timestamp;
  lastInteractionResult?: number; // 1-5
  totalTouches?: number;
  flaggedForFollowUp?: boolean;
  // Unflag audit trail (written when a rep removes the flag)
  unflaggedBy?: string;       // repId who removed the flag
  unflaggedAt?: Timestamp;
  unflagNote?: string;        // required reason for removing flag
  // Manager tags (predefined set, multi-select)
  tags?: string[];
  source?: 'import' | 'field_entry';
  createdByRepId?: string;
  assignedRepId?: string;

  // Doctor-not-at-address report (set by rep in the field)
  reported?: boolean;
  reportedAt?: Timestamp;
  reportedBy?: string;       // repId who reported
  reportedReason?: 'address_nonexistent' | 'org_not_there' | 'org_there_doctor_redirected' | 'org_there_unknown';
}
