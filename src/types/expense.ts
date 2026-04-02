import { Timestamp } from 'firebase/firestore';

export type ExpenseCategory =
  | 'combustivel'
  | 'alimentacao'
  | 'estacionamento'
  | 'pedagio'
  | 'outro';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  combustivel: 'Combustível',
  alimentacao: 'Alimentação',
  estacionamento: 'Estacionamento',
  pedagio: 'Pedágio',
  outro: 'Outro',
};

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  combustivel: 'car-outline',
  alimentacao: 'restaurant-outline',
  estacionamento: 'location-outline',
  pedagio: 'navigate-outline',
  outro: 'receipt-outline',
};

export interface Expense {
  id: string;
  repId: string;
  repName: string;
  amount: number; // BRL, e.g. 45.50
  category: ExpenseCategory;
  notes?: string;
  receiptUrl: string; // Firebase Storage download URL
  receiptPath: string; // Storage path (for future deletion)
  date: Timestamp; // Date of the expense (not submission time)
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
