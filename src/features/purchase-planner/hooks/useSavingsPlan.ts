import { useMemo } from 'react'
import { SavingsPlan, MonthlyBreakdown } from '../../../types'
import { addMonths, getMonthKey, formatMonthYear } from '../../../lib/utils'

export function useSavingsPlan(
  item: string,
  targetAmount: number,
  monthlyIncome: number,
  fixedExpenses: number,
  averageVariableExpenses: number,
  customMonthlySaving?: number
): SavingsPlan | null {
  return useMemo(() => {
    if (!item || targetAmount <= 0 || monthlyIncome <= 0) {
      return null
    }

    // Calculate monthly surplus
    const monthlySurplus = monthlyIncome - fixedExpenses - averageVariableExpenses

    // If surplus is negative, return null
    if (monthlySurplus <= 0) {
      return null
    }

    // Calculate safe amount (90% of surplus for margin)
    const safeAmount = monthlySurplus * 0.9
    const suggestedSaving = customMonthlySaving || safeAmount * 0.4

    // Validate minimum saving
    if (suggestedSaving <= 0) {
      return null
    }

    // Calculate months needed
    const monthsNeeded = Math.ceil(targetAmount / suggestedSaving)

    // Generate monthly breakdown
    const breakdown: MonthlyBreakdown[] = []
    const startDate = new Date()
    let cumulativeTotal = 0

    for (let i = 0; i < monthsNeeded; i++) {
      const monthDate = addMonths(startDate, i)
      const monthKey = getMonthKey(monthDate)
      const monthLabel = formatMonthYear(monthDate)

      cumulativeTotal += suggestedSaving
      const percentComplete = Math.min((cumulativeTotal / targetAmount) * 100, 100)

      breakdown.push({
        month: monthKey,
        monthLabel,
        plannedAmount: suggestedSaving,
        cumulativeTotal: Math.min(cumulativeTotal, targetAmount),
        percentComplete,
      })
    }

    return {
      item,
      targetAmount,
      monthsNeeded,
      monthlySaving: suggestedSaving,
      startDate,
      endDate: addMonths(startDate, monthsNeeded),
      breakdown,
      monthlySurplus,
      suggestedSaving,
    }
  }, [item, targetAmount, monthlyIncome, fixedExpenses, averageVariableExpenses, customMonthlySaving])
}

