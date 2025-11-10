import { create } from 'zustand'
import { PurchaseGoal, SavingsProgress, PurchaseGoalAIAnalysis } from '../types'
import { saveToSupabaseStorage, loadFromSupabaseStorage } from '../services/supabaseStorage'

interface PurchaseGoalStore {
  goals: PurchaseGoal[]
  progress: SavingsProgress[]
  analyses: PurchaseGoalAIAnalysis[]
  userId: string | null

  // Actions
  addGoal: (goal: Omit<PurchaseGoal, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateGoal: (id: string, updates: Partial<PurchaseGoal>) => void
  deleteGoal: (id: string) => void
  addProgress: (progress: Omit<SavingsProgress, 'goalId'> & { goalId: string }) => void
  updateProgress: (goalId: string, month: string, updates: Partial<SavingsProgress>) => void
  saveAnalysis: (analysis: PurchaseGoalAIAnalysis) => void
  getAnalysis: (goalId: string) => PurchaseGoalAIAnalysis | undefined
  getActiveGoals: () => PurchaseGoal[]
  getGoalProgress: (goalId: string) => SavingsProgress[]
  getGoalById: (id: string) => PurchaseGoal | undefined

  // Persistence
  setUserId: (userId: string | null) => void
  loadFromStorage: (userId?: string) => Promise<void>
  saveToStorage: () => Promise<void>
}

const STORAGE_KEY = 'purchase-goals-data'

export const usePurchaseGoalStore = create<PurchaseGoalStore>((set, get) => ({
  goals: [],
  progress: [],
  analyses: [],
  userId: null,

  setUserId: (userId) => {
    set({ userId })
  },

  addGoal: (goalData) => {
    const newGoal: PurchaseGoal = {
      ...goalData,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      goals: [...state.goals, newGoal],
    }))
    get().saveToStorage()
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      ),
    }))
    get().saveToStorage()
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
      progress: state.progress.filter((p) => p.goalId !== id),
      analyses: state.analyses.filter((a) => a.goalId !== id),
    }))
    get().saveToStorage()
  },

  addProgress: (progressData) => {
    const newProgress: SavingsProgress = {
      ...progressData,
    }
    set((state) => {
      const existing = state.progress.find(
        (p) => p.goalId === progressData.goalId && p.month === progressData.month
      )
      if (existing) {
        return {
          progress: state.progress.map((p) =>
            p.goalId === progressData.goalId && p.month === progressData.month
              ? { ...p, ...newProgress }
              : p
          ),
        }
      }
      return {
        progress: [...state.progress, newProgress],
      }
    })
    get().saveToStorage()
  },

  updateProgress: (goalId, month, updates) => {
    set((state) => ({
      progress: state.progress.map((p) =>
        p.goalId === goalId && p.month === month ? { ...p, ...updates } : p
      ),
    }))
    get().saveToStorage()
  },

  saveAnalysis: (analysis) => {
    set((state) => {
      const existing = state.analyses.find((a) => a.goalId === analysis.goalId)
      if (existing) {
        return {
          analyses: state.analyses.map((a) =>
            a.goalId === analysis.goalId ? analysis : a
          ),
        }
      }
      return {
        analyses: [...state.analyses, analysis],
      }
    })
    get().saveToStorage()
  },

  getAnalysis: (goalId) => {
    return get().analyses.find((a) => a.goalId === goalId)
  },

  getActiveGoals: () => {
    return get().goals.filter((goal) => goal.status === 'active')
  },

  getGoalProgress: (goalId) => {
    return get().progress.filter((p) => p.goalId === goalId)
  },

  getGoalById: (id) => {
    return get().goals.find((goal) => goal.id === id)
  },

  loadFromStorage: async (userId?: string) => {
    const targetUserId = userId || get().userId || 'anonymous'

    try {
      // Try Supabase first
      const supabaseData = await loadFromSupabaseStorage(targetUserId)
      if (supabaseData?.purchaseGoals) {
        set({
          goals: supabaseData.purchaseGoals.goals || [],
          progress: supabaseData.purchaseGoals.progress || [],
          analyses: supabaseData.purchaseGoals.analyses || [],
        })
        return
      }

      // Fallback to localStorage
      const localData = localStorage.getItem(`${STORAGE_KEY}-${targetUserId}`)
      if (localData) {
        const parsed = JSON.parse(localData)
        set({
          goals: parsed.goals || [],
          progress: parsed.progress || [],
          analyses: parsed.analyses || [],
        })
      }
    } catch (error) {
      console.error('Error loading purchase goals from storage:', error)
    }
  },

  saveToStorage: async () => {
    const { goals, progress, analyses, userId } = get()
    const targetUserId = userId || 'anonymous'
    const data = {
      purchaseGoals: {
        goals,
        progress,
        analyses,
      },
    }

    try {
      // Try Supabase first
      const saved = await saveToSupabaseStorage(targetUserId, {
        ...(await loadFromSupabaseStorage(targetUserId).catch(() => null)) || {},
        ...data,
      })

      if (!saved) {
        // Fallback to localStorage
        localStorage.setItem(`${STORAGE_KEY}-${targetUserId}`, JSON.stringify(data.purchaseGoals))
      }
    } catch (error) {
      console.error('Error saving purchase goals to storage:', error)
      // Fallback to localStorage
      localStorage.setItem(`${STORAGE_KEY}-${targetUserId}`, JSON.stringify(data.purchaseGoals))
    }
  },
}))

