import { Timestamp } from 'firebase/firestore';

export type ReportReason =
  | 'address_nonexistent'
  | 'org_not_there'
  | 'org_there_doctor_redirected'
  | 'org_there_unknown';

/** Portuguese labels shown to the rep when choosing a reason */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  address_nonexistent:
    'O endereço não existe',
  org_not_there:
    'Nem a organização nem o médico estão neste endereço',
  org_there_doctor_redirected:
    'A organização está aqui, mas indicaram outro local para o médico',
  org_there_unknown:
    'A organização está aqui, mas ninguém sabe onde encontrar o médico',
};

export const REPORT_REASONS = Object.keys(
  REPORT_REASON_LABELS
) as ReportReason[];

export interface DoctorReport {
  id: string;
  doctorId: string;
  doctorName: string;
  repId: string;
  repName?: string;
  reason: ReportReason;
  notes?: string;
  /** Pending until an analyst/admin verifies and resolves the data issue */
  status: 'pending' | 'resolved';
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
