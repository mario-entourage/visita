import type { InteractionType } from '@/types/interaction';

export const INTERACTION_WEIGHTS: Record<InteractionType, number> = {
  field_visit: 1.0,
  clinical_event: 1.5,
  congress: 0.5,
  digital: 0.25,
};

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  field_visit: 'Visita de Campo',
  clinical_event: 'Evento Clínico',
  congress: 'Congresso',
  digital: 'Digital',
};

export const RESULT_LABELS: Record<number, string> = {
  1: 'Não',
  2: 'Provavelmente Não',
  3: 'Aberto',
  4: 'Vai Prescrever',
  5: 'Prescrevendo',
};

export const PROPENSITY_LABELS: Record<number, string> = {
  1: 'Muito Baixa',
  2: 'Baixa',
  3: 'Moderada',
  4: 'Alta',
  5: 'Muito Alta',
};

// ---------------------------------------------------------------------------
// Doctor tags (predefined, Gerente/admin only)
// ---------------------------------------------------------------------------

export type DoctorTagKey =
  | 'potencial-alto'
  | 'nova-clinica'
  | 'visita-conjunta'
  | 'prioritario'
  | 'formador-opiniao'
  | 'risco-inatividade';

export interface DoctorTag {
  key: DoctorTagKey;
  label: string;
  abbr: string; // ≤6 chars for mobile display
  color: string; // chip background tint
}

export const DOCTOR_TAGS: DoctorTag[] = [
  { key: 'potencial-alto', label: 'Potencial Alto', abbr: 'P.Alto', color: '#22c55e' },
  { key: 'nova-clinica', label: 'Nova Clínica', abbr: 'N.Cli', color: '#3b82f6' },
  { key: 'visita-conjunta', label: 'Visita Conjunta', abbr: 'V.Conj', color: '#8b5cf6' },
  { key: 'prioritario', label: 'Prioritário', abbr: 'Prior.', color: '#ef4444' },
  { key: 'formador-opiniao', label: 'Formador de Opinião', abbr: 'F.Op.', color: '#f59e0b' },
  { key: 'risco-inatividade', label: 'Risco de Inatividade', abbr: 'Risco', color: '#6b7280' },
];

export const DOCTOR_TAG_MAP: Record<string, DoctorTag> = Object.fromEntries(
  DOCTOR_TAGS.map((t) => [t.key, t])
);

// Valid tag keys for filtering before Firestore write
export const VALID_TAG_KEYS = new Set<string>(DOCTOR_TAGS.map((t) => t.key));

export const BRAZILIAN_STATES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
};
