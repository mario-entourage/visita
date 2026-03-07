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
  1: 'Não Receptivo',
  2: 'Neutro',
  3: 'Curioso',
  4: 'Interessado',
  5: 'Experimentando',
  6: 'Prescrevendo',
  7: 'Evangelizando',
};

export const PROPENSITY_LABELS: Record<number, string> = {
  1: 'Muito Baixa',
  2: 'Baixa',
  3: 'Moderada',
  4: 'Alta',
  5: 'Muito Alta',
};
