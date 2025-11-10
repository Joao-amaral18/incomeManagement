import { create } from 'zustand'
import { Expense, PaymentRecord, Notification, Category, Income } from '../types'
import { getDaysUntilDue } from '../lib/utils'
import { saveToSupabaseStorage, loadFromSupabaseStorage } from '../services/supabaseStorage'

interface ExpenseStore {
  expenses: Expense[]
  paymentHistory: PaymentRecord[]
  notifications: Notification[]
  incomes: Income[]
  darkMode: boolean
  userId: string | null
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  toggleExpenseActive: (id: string) => void
  markAsPaid: (expenseId: string, month: string, paidValue?: number) => void
  unmarkAsPaid: (expenseId: string, month: string) => void
  toggleDarkMode: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  
  // Income Actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void
  updateIncome: (id: string, updates: Partial<Income>) => void
  deleteIncome: (id: string) => void
  
  // Computed
  getTotalMonthly: () => number
  getTotalMonthlyIncome: () => number
  getCurrentMonthIncome: () => number
  getExpensesByCategory: () => Record<Category, Expense[]>
  getUpcomingExpenses: (days: number) => Expense[]
  isPaidThisMonth: (expenseId: string) => boolean
  getCurrentMonth: () => string
  
  // Persistence
  setUserId: (userId: string | null) => void
  loadFromStorage: (userId?: string) => Promise<void>
  saveToStorage: () => Promise<void>
  checkNotifications: () => void
}

const STORAGE_KEY = 'expense-manager-data'

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  paymentHistory: [],
  notifications: [],
  incomes: [],
  darkMode: false,
  userId: null,

  setUserId: (userId) => {
    set({ userId })
  },

  addExpense: (expenseData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      expenses: [...state.expenses, newExpense],
    }))
    get().saveToStorage()
    get().checkNotifications()
  },

  updateExpense: (id, updates) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }))
    get().saveToStorage()
    get().checkNotifications()
  },

  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((exp) => exp.id !== id),
      paymentHistory: state.paymentHistory.filter((p) => p.expenseId !== id),
    }))
    get().saveToStorage()
  },

  toggleExpenseActive: (id) => {
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, isActive: !exp.isActive } : exp
      ),
    }))
    get().saveToStorage()
  },

  markAsPaid: (expenseId, month, paidValue) => {
    const expense = get().expenses.find((e) => e.id === expenseId)
    if (!expense) return

    set((state) => {
      const existing = state.paymentHistory.find(
        (p) => p.expenseId === expenseId && p.month === month
      )
      
      if (existing) {
        return {
          paymentHistory: state.paymentHistory.map((p) =>
            p.expenseId === expenseId && p.month === month
              ? { ...p, paid: true, paidDate: new Date().toISOString(), paidValue: paidValue || expense.value }
              : p
          ),
        }
      }
      
      return {
        paymentHistory: [
          ...state.paymentHistory,
          {
            expenseId,
            month,
            paid: true,
            paidDate: new Date().toISOString(),
            paidValue: paidValue || expense.value,
          },
        ],
      }
    })
    get().saveToStorage()
  },

  unmarkAsPaid: (expenseId, month) => {
    set((state) => ({
      paymentHistory: state.paymentHistory.map((p) =>
        p.expenseId === expenseId && p.month === month
          ? { ...p, paid: false, paidDate: undefined, paidValue: undefined }
          : p
      ),
    }))
    get().saveToStorage()
  },

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.darkMode
      document.documentElement.classList.toggle('dark', newMode)
      return { darkMode: newMode }
    })
    get().saveToStorage()
  },

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    }
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }))
    get().saveToStorage()
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
    get().saveToStorage()
  },

  clearNotifications: () => {
    set({ notifications: [] })
    get().saveToStorage()
  },

  addIncome: (incomeData) => {
    const newIncome: Income = {
      ...incomeData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      incomes: [...state.incomes, newIncome],
    }))
    get().saveToStorage()
  },

  updateIncome: (id, updates) => {
    set((state) => ({
      incomes: state.incomes.map((inc) =>
        inc.id === id ? { ...inc, ...updates } : inc
      ),
    }))
    get().saveToStorage()
  },

  deleteIncome: (id) => {
    set((state) => ({
      incomes: state.incomes.filter((inc) => inc.id !== id),
    }))
    get().saveToStorage()
  },

  getTotalMonthly: () => {
    const { expenses } = get()
    return expenses
      .filter((exp) => exp.isActive)
      .reduce((total, exp) => total + exp.value, 0)
  },

  getTotalMonthlyIncome: () => {
    const { incomes } = get()
    return incomes.reduce((total, inc) => total + inc.amount, 0)
  },

  getCurrentMonthIncome: () => {
    const { incomes } = get()
    const currentMonth = get().getCurrentMonth()
    return incomes
      .filter((inc) => inc.month === currentMonth)
      .reduce((total, inc) => total + inc.amount, 0)
  },

  getExpensesByCategory: () => {
    const { expenses } = get()
    const grouped: Record<Category, Expense[]> = {
      assinaturas: [],
      educacao: [],
      moradia: [],
      transporte: [],
      saude: [],
      outros: [],
    }
    
    expenses
      .filter((exp) => exp.isActive)
      .forEach((exp) => {
        grouped[exp.category].push(exp)
      })
    
    return grouped
  },

  getUpcomingExpenses: (days) => {
    const { expenses } = get()
    return expenses
      .filter((exp) => exp.isActive)
      .filter((exp) => {
        const daysUntil = getDaysUntilDue(exp.dueDay)
        return daysUntil >= 0 && daysUntil <= days
      })
      .sort((a, b) => getDaysUntilDue(a.dueDay) - getDaysUntilDue(b.dueDay))
  },

  isPaidThisMonth: (expenseId) => {
    const { paymentHistory } = get()
    const currentMonth = get().getCurrentMonth()
    const record = paymentHistory.find(
      (p) => p.expenseId === expenseId && p.month === currentMonth
    )
    return record?.paid || false
  },

  getCurrentMonth: () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  },

  checkNotifications: () => {
    const { expenses } = get()
    const today = new Date()
    
    expenses
      .filter((exp) => exp.isActive)
      .forEach((exp) => {
        const daysUntil = getDaysUntilDue(exp.dueDay)
        
        if (daysUntil === 7) {
          get().addNotification({
            type: 'due-date',
            message: `${exp.name} vence em 7 dias (dia ${exp.dueDay})`,
            expenseId: exp.id,
            date: today.toISOString(),
            read: false,
          })
        } else if (daysUntil === 3) {
          get().addNotification({
            type: 'due-date',
            message: `${exp.name} vence em 3 dias (dia ${exp.dueDay})`,
            expenseId: exp.id,
            date: today.toISOString(),
            read: false,
          })
        } else if (daysUntil === 0) {
          get().addNotification({
            type: 'due-date',
            message: `${exp.name} vence hoje!`,
            expenseId: exp.id,
            date: today.toISOString(),
            read: false,
          })
        }
      })
  },

  loadFromStorage: async (userId?: string) => {
    try {
      let data: any = null

      // Try Supabase Storage first if userId is provided
      if (userId) {
        data = await loadFromSupabaseStorage(userId)
      }

      // Fallback to localStorage if Supabase fails or no userId
      if (!data) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          data = JSON.parse(stored)
        }
      }

      if (data) {
        set({
          expenses: data.expenses || [],
          paymentHistory: data.paymentHistory || [],
          notifications: data.notifications || [],
          incomes: data.incomes || [],
          darkMode: data.darkMode || false,
        })
        
        if (data.darkMode) {
          document.documentElement.classList.add('dark')
        }
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  },

  saveToStorage: async () => {
    try {
      const { expenses, paymentHistory, notifications, incomes, darkMode, userId } = get()
      const data = {
        expenses,
        paymentHistory,
        notifications,
        incomes,
        darkMode,
      }

      // Try Supabase Storage first if userId is available
      if (userId) {
        const success = await saveToSupabaseStorage(userId, data)
        if (success) {
          return // Successfully saved to Supabase
        }
      }

      // Fallback to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to storage:', error)
      // Fallback to localStorage on error
      try {
        const { expenses, paymentHistory, notifications, incomes, darkMode } = get()
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            expenses,
            paymentHistory,
            notifications,
            incomes,
            darkMode,
          })
        )
      } catch (localError) {
        console.error('Error saving to localStorage:', localError)
      }
    }
  },
}))

