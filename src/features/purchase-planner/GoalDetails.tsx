import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatCurrency, formatMonthYear } from '../../lib/utils'
import { SavingsPlan, PurchaseGoalAIAnalysis } from '../../types'
import { useAIAnalysis } from './hooks/useAIAnalysis'
import { useExpenseStore } from '../../store/expenseStore'
import { usePurchaseGoalStore } from '../../store/purchaseGoalStore'
import { Loader2, Sparkles, TrendingUp, Calendar, Target } from 'lucide-react'

interface GoalDetailsProps {
  plan: SavingsPlan
  onSave: (analysis?: PurchaseGoalAIAnalysis) => void
  onCancel: () => void
}

export function GoalDetails({ plan, onSave, onCancel }: GoalDetailsProps) {
  const { expenses, getTotalMonthly, getTotalMonthlyIncome } = useExpenseStore()
  const { saveAnalysis } = usePurchaseGoalStore()
  const { analyzeSavingsPlan, loading, error } = useAIAnalysis()
  const [analysis, setAnalysis] = useState<PurchaseGoalAIAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const monthlyIncome = getTotalMonthlyIncome()
  const fixedExpenses = getTotalMonthly()
  const averageVariableExpenses = monthlyIncome * 0.3

  useEffect(() => {
    if (showAnalysis && !analysis && !loading) {
      loadAnalysis()
    }
  }, [showAnalysis])

  const loadAnalysis = async () => {
    const result = await analyzeSavingsPlan(
      plan,
      expenses,
      monthlyIncome,
      fixedExpenses,
      averageVariableExpenses
    )
    if (result) {
      setAnalysis(result)
    }
  }

  const handleSave = () => {
    // Pass analysis to parent so it can be saved with correct goalId
    onSave(analysis || undefined)
  }

  const getProgressBar = (percent: number) => {
    const filled = Math.round(percent / 10)
    const empty = 10 - filled
    return '▓'.repeat(filled) + '░'.repeat(empty)
  }

  return (
    <div className="space-y-6">
      {/* Main Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Seu Plano para: {plan.item}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">🎯 Meta</p>
              <p className="text-lg font-semibold">{formatCurrency(plan.targetAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">📅 Tempo necessário</p>
              <p className="text-lg font-semibold">{plan.monthsNeeded} meses</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">💰 Guardar por mês</p>
              <p className="text-lg font-semibold">{formatCurrency(plan.monthlySaving)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">📈 Sua Situação Financeira</p>
            <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Renda mensal:</span>
                <span className="font-medium">{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos fixos:</span>
                <span className="font-medium">{formatCurrency(fixedExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sobra atual:</span>
                <span className="font-medium">{formatCurrency(plan.monthlySurplus)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Capacidade sugerida:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(plan.suggestedSaving)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  (40% da sobra)
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">📅 Plano Mês a Mês</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {plan.breakdown.map((month, index) => (
                <div
                  key={month.month}
                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="w-20 text-xs">{month.monthLabel}</span>
                    <span className="font-medium w-24">
                      {formatCurrency(month.cumulativeTotal)}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">
                      [{getProgressBar(month.percentComplete)}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Análise com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAnalysis ? (
            <Button
              onClick={() => setShowAnalysis(true)}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Análise com IA
            </Button>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analisando com IA...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
              <p className="text-sm text-red-900 dark:text-red-100">
                Erro: {error}
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Viability Assessment */}
              <div>
                <p className="text-sm font-medium mb-2">1. Avaliação do Plano</p>
                <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={analysis.viability.isRealistic ? 'default' : 'destructive'}
                    >
                      {analysis.viability.isRealistic ? 'Realista' : 'Arriscado'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Probabilidade de sucesso: {analysis.viability.successProbability}%
                    </span>
                  </div>
                  <p className="text-xs">{analysis.viability.reasoning}</p>
                  {analysis.viability.risks.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Riscos:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground">
                        {analysis.viability.risks.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Acceleration Options */}
              <div>
                <p className="text-sm font-medium mb-2">2. Sugestões de Aceleração</p>
                <div className="space-y-2">
                  {analysis.accelerationOptions.map((option, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {option.scenario === 'light' && '🚀 Leve'}
                          {option.scenario === 'moderate' && '⚡ Moderado'}
                          {option.scenario === 'intense' && '🔥 Intenso'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Reduz {option.monthsReduced} meses
                        </span>
                      </div>
                      <p className="text-xs mb-2">{option.description}</p>
                      {option.suggestions.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {option.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <p className="text-sm font-medium mb-2">3. Dicas Práticas</p>
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  {analysis.tips.map((tip, i) => (
                    <p key={i} className="text-xs">
                      • {tip}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Salvar Meta
        </Button>
      </div>
    </div>
  )
}

