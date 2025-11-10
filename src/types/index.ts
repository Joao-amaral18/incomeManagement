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
  dueDay?: number; // 1-31
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

// Purchase Planner Types
export interface PurchaseGoal {
  id: string;
  item: string;
  description?: string;
  targetAmount: number;
  monthlySaving: number;
  currentSaved: number;
  startDate: string;
  estimatedEndDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  category: string; // 'eletrônicos', 'viagem', 'carro', etc
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBreakdown {
  month: string; // "2024-11"
  monthLabel: string; // "Nov/2024"
  plannedAmount: number;
  cumulativeTotal: number;
  percentComplete: number;
}

export interface SavingsPlan {
  item: string;
  targetAmount: number;
  monthsNeeded: number;
  monthlySaving: number;
  startDate: Date;
  endDate: Date;
  breakdown: MonthlyBreakdown[];
  monthlySurplus: number;
  suggestedSaving: number;
}

export interface SavingsProgress {
  goalId: string;
  month: string; // "2024-11"
  plannedAmount: number;
  actualAmount: number;
  cumulativeTotal: number;
  percentComplete: number;
  onTrack: boolean;
}

export interface PurchaseGoalAIAnalysis {
  goalId: string;
  viability: {
    isRealistic: boolean;
    successProbability: number;
    risks: string[];
    reasoning: string;
    suggestedAmount?: number;
    alternatives?: string[];
  };
  accelerationOptions: {
    scenario: 'light' | 'moderate' | 'intense';
    monthsReduced: number;
    additionalMonthlySaving: number;
    suggestions: string[];
    description: string;
  }[];
  tips: string[];
  generatedAt: string;
}

