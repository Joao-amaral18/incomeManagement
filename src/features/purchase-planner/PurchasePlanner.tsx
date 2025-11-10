import { useState, useEffect } from 'react'
import { CreateGoalModal } from './CreateGoalModal'
import { GoalDetails } from './GoalDetails'
import { GoalsList } from './GoalsList'
import { useSavingsPlan } from './hooks/useSavingsPlan'
import { usePurchaseGoalStore } from '../../store/purchaseGoalStore'
import { useExpenseStore } from '../../store/expenseStore'
import { SavingsPlan, PurchaseGoal, MonthlyBreakdown } from '../../types'
import { addMonths, getMonthKey, formatMonthYear } from '../../lib/utils'
import { Button } from '../../components/ui/button'

type View = 'list' | 'create' | 'details' | 'view'

export function PurchasePlanner() {
  const { getTotalMonthly, getTotalMonthlyIncome, userId } = useExpenseStore()
  const { addGoal, loadFromStorage, setUserId } = usePurchaseGoalStore()
  const [view, setView] = useState<View>('list')
  const [currentPlan, setCurrentPlan] = useState<SavingsPlan | null>(null)
  const [viewingGoal, setViewingGoal] = useState<PurchaseGoal | null>(null)

  useEffect(() => {
    if (userId) {
      setUserId(userId)
      loadFromStorage(userId)
    } else {
      loadFromStorage()
    }
  }, [userId, loadFromStorage, setUserId])

  const handleCalculate = (plan: ReturnType<typeof useSavingsPlan>) => {
    if (plan) {
      setCurrentPlan(plan)
      setView('details')
    }
  }

  const handleSaveGoal = (analysis?: any) => {
    if (!currentPlan) return

    const startDate = new Date()
    const endDate = addMonths(startDate, currentPlan.monthsNeeded)

    // Generate goal ID first (same format as store)
    const goalId = Date.now().toString(36) + Math.random().toString(36).substr(2)

    // Create goal with pre-generated ID
    const goalData = {
      item: currentPlan.item,
      targetAmount: currentPlan.targetAmount,
      monthlySaving: currentPlan.monthlySaving,
      currentSaved: 0,
      startDate: startDate.toISOString(),
      estimatedEndDate: endDate.toISOString(),
      status: 'active' as const,
      priority: 'medium' as const,
      category: 'outros',
    }

    // Manually add goal with our ID
    const { addGoal: storeAddGoal, saveAnalysis } = usePurchaseGoalStore.getState()
    const newGoal = {
      ...goalData,
      id: goalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add goal directly to store
    usePurchaseGoalStore.setState((state) => ({
      goals: [...state.goals, newGoal],
    }))
    usePurchaseGoalStore.getState().saveToStorage()

    // Save analysis with correct goalId if available
    if (analysis) {
      saveAnalysis({
        ...analysis,
        goalId,
      })
    }

    setCurrentPlan(null)
    setView('list')
  }

  const handleViewGoal = (goal: PurchaseGoal) => {
    setViewingGoal(goal)
    setView('view')
  }

  const handleCancel = () => {
    setCurrentPlan(null)
    setView('list')
  }

  if (view === 'create') {
    return (
      <CreateGoalModal
        open={true}
        onOpenChange={(open) => {
          if (!open) setView('list')
        }}
        onCalculate={handleCalculate}
      />
    )
  }

  if (view === 'details' && currentPlan) {
    return (
      <GoalDetails
        plan={currentPlan}
        onSave={(analysis) => handleSaveGoal(analysis)}
        onCancel={handleCancel}
      />
    )
  }

  if (view === 'view' && viewingGoal) {
    // Reconstruct plan from goal for viewing
    const monthlyIncome = getTotalMonthlyIncome()
    const fixedExpenses = getTotalMonthly()
    const averageVariableExpenses = monthlyIncome * 0.3
    const monthsNeeded = Math.ceil(viewingGoal.targetAmount / viewingGoal.monthlySaving)
    const startDate = new Date(viewingGoal.startDate)

    // Generate breakdown
    const breakdown: MonthlyBreakdown[] = []
    let cumulativeTotal = viewingGoal.currentSaved

    for (let i = 0; i < monthsNeeded; i++) {
      const monthDate = addMonths(startDate, i)
      const monthKey = getMonthKey(monthDate)
      const monthLabel = formatMonthYear(monthDate)

      cumulativeTotal += viewingGoal.monthlySaving
      const percentComplete = Math.min((cumulativeTotal / viewingGoal.targetAmount) * 100, 100)

      breakdown.push({
        month: monthKey,
        monthLabel,
        plannedAmount: viewingGoal.monthlySaving,
        cumulativeTotal: Math.min(cumulativeTotal, viewingGoal.targetAmount),
        percentComplete,
      })
    }

    const reconstructedPlan: SavingsPlan = {
      item: viewingGoal.item,
      targetAmount: viewingGoal.targetAmount,
      monthsNeeded,
      monthlySaving: viewingGoal.monthlySaving,
      startDate,
      endDate: new Date(viewingGoal.estimatedEndDate),
      breakdown,
      monthlySurplus: monthlyIncome - fixedExpenses - averageVariableExpenses,
      suggestedSaving: viewingGoal.monthlySaving,
    }

    return (
      <div>
        <Button
          variant="outline"
          onClick={() => {
            setViewingGoal(null)
            setView('list')
          }}
          className="mb-4"
        >
          ← Voltar
        </Button>
        <GoalDetails
          plan={reconstructedPlan}
          onSave={() => {
            setViewingGoal(null)
            setView('list')
          }}
          onCancel={() => {
            setViewingGoal(null)
            setView('list')
          }}
        />
      </div>
    )
  }

  return (
    <GoalsList
      onNewGoal={() => setView('create')}
      onViewGoal={handleViewGoal}
    />
  )
}

