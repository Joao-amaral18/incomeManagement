import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatCurrency, formatMonthYear, parseMonthKey } from '../../lib/utils'
import { usePurchaseGoalStore } from '../../store/purchaseGoalStore'
import { PurchaseGoal } from '../../types'
import { Target, Edit, Trash2, Plus, Eye } from 'lucide-react'
import { useState } from 'react'

interface GoalsListProps {
  onNewGoal: () => void
  onViewGoal: (goal: PurchaseGoal) => void
}

export function GoalsList({ onNewGoal, onViewGoal }: GoalsListProps) {
  const { goals, deleteGoal, getGoalProgress } = usePurchaseGoalStore()
  const activeGoals = goals.filter((g) => g.status === 'active')

  const getProgressPercent = (goal: PurchaseGoal) => {
    return (goal.currentSaved / goal.targetAmount) * 100
  }

  const getProgressBar = (percent: number) => {
    const filled = Math.round(percent / 10)
    const empty = 10 - filled
    return '▓'.repeat(filled) + '░'.repeat(empty)
  }

  const getMonthsNeeded = (goal: PurchaseGoal) => {
    return Math.ceil(goal.targetAmount / goal.monthlySaving)
  }

  const getNextDepositDate = (goal: PurchaseGoal) => {
    const startDate = new Date(goal.startDate)
    const progress = getGoalProgress(goal.id)
    const monthsCompleted = progress.length
    const nextMonth = new Date(startDate)
    nextMonth.setMonth(nextMonth.getMonth() + monthsCompleted)
    return formatMonthYear(nextMonth)
  }

  const handleDelete = (goal: PurchaseGoal) => {
    if (confirm(`Tem certeza que deseja excluir a meta "${goal.item}"?`)) {
      deleteGoal(goal.id)
    }
  }

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Você ainda não tem metas de compra cadastradas
          </p>
          <Button onClick={onNewGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Minhas Metas de Compra
        </h2>
        <Button onClick={onNewGoal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="space-y-3">
        {activeGoals.map((goal) => {
          const progressPercent = getProgressPercent(goal)
          const categoryEmoji = getCategoryEmoji(goal.category)

          return (
            <Card key={goal.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{categoryEmoji}</span>
                      <h3 className="font-semibold">{goal.item}</h3>
                      <Badge
                        variant={
                          goal.priority === 'high'
                            ? 'destructive'
                            : goal.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {goal.priority === 'high' && 'Alta'}
                        {goal.priority === 'medium' && 'Média'}
                        {goal.priority === 'low' && 'Baixa'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        {formatCurrency(goal.targetAmount)} • {getMonthsNeeded(goal)} meses
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          [{getProgressBar(progressPercent)}] {progressPercent.toFixed(0)}% (
                          {formatCurrency(goal.currentSaved)})
                        </span>
                      </div>
                      <p className="text-xs">
                        Próximo depósito: {getNextDepositDate(goal)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewGoal(goal)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver plano
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement edit
                      alert('Edição em breve')
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(goal)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    eletrônicos: '📱',
    viagem: '✈️',
    carro: '🚗',
    casa: '🏠',
    educação: '🎓',
    saúde: '🏥',
    outros: '🎯',
  }
  return emojis[category] || '🎯'
}

