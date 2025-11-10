export type Category = 
  | 'assinaturas'
  | 'educacao'
  | 'moradia'
  | 'transporte'
  | 'saude'
  | 'outros';

export interface Expense {
  id: string;
  name: string;
  value: number;
  dueDay: number; // 1-31
  category: Category;
  paymentMethod?: string;
  notes?: string;
  endDate?: string; // ISO date string
  isActive: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  expenseId: string;
  month: string; // YYYY-MM
  paid: boolean;
  paidDate?: string;
  paidValue?: number;
}

export interface AIAnalysis {
  id: string;
  type: 'optimization' | 'waste' | 'cut-planner' | 'negotiation';
  createdAt: string;
  data: any;
}

export interface OptimizationSuggestion {
  expenseId: string;
  description: string;
  potentialSavings: number;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WasteDetection {
  expenseId: string;
  issue: string;
  potentialSavings: number;
  recommendation: string;
}

export interface CutPlan {
  level: 'suave' | 'moderado' | 'agressivo';
  items: string[];
  totalSavings: number;
  description: string;
}

export interface Notification {
  id: string;
  type: 'due-date' | 'value-increase' | 'category-limit';
  message: string;
  expenseId?: string;
  date: string;
  read: boolean;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  month: string; // YYYY-MM
  createdAt: string;
}

