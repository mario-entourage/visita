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
