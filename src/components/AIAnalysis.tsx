import { useState } from 'react'
import { useExpenseStore } from '../store/expenseStore'
import { analyzeExpenses, detectWaste, createCutPlans, generateNegotiationScript } from '../services/geminiService'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Sparkles, AlertTriangle, Scissors, MessageSquare, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../lib/utils'

export function AIAnalysis() {
  const { expenses } = useExpenseStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analysisType, setAnalysisType] = useState<string | null>(null)

  const activeExpenses = expenses.filter((exp) => exp.isActive)

  const handleAnalyze = async (type: string) => {
    if (activeExpenses.length === 0) {
      alert('Cadastre pelo menos um gasto para usar a análise de IA')
      return
    }

    setLoading(type)
    setAnalysisType(type)
    setAnalysisResult(null)

    try {
      let result: string
      const { getCurrentMonthIncome } = useExpenseStore.getState()
      const monthlyIncome = getCurrentMonthIncome()
      
      switch (type) {
        case 'optimization':
          result = await analyzeExpenses(activeExpenses, monthlyIncome || undefined)
          break
        case 'waste':
          result = await detectWaste(activeExpenses)
          break
        case 'cut-planner':
          const targetSavings = prompt('Meta de redução mensal (R$):', '300')
          if (!targetSavings) {
            setLoading(null)
            return
          }
          result = await createCutPlans(activeExpenses, parseFloat(targetSavings))
          break
        case 'negotiation':
          const expenseName = prompt('Nome do gasto para negociar:')
          if (!expenseName) {
            setLoading(null)
            return
          }
          const expense = activeExpenses.find((e) => e.name.toLowerCase().includes(expenseName.toLowerCase()))
          if (!expense) {
            alert('Gasto não encontrado')
            setLoading(null)
            return
          }
          result = await generateNegotiationScript(expense)
          break
        default:
          return
      }

      try {
        const parsed = JSON.parse(result)
        setAnalysisResult(parsed)
      } catch {
        setAnalysisResult({ raw: result })
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`)
      setAnalysisResult(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Análises com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleAnalyze('optimization')}
              disabled={loading !== null || activeExpenses.length === 0}
              className="h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">Análise de Otimização</span>
              </div>
              <span className="text-xs text-left mt-1 opacity-90">
                Identifique gastos que podem ser reduzidos
              </span>
            </Button>

            <Button
              onClick={() => handleAnalyze('waste')}
              disabled={loading !== null || activeExpenses.length === 0}
              variant="secondary"
              className="h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Detector de Desperdícios</span>
              </div>
              <span className="text-xs text-left mt-1 opacity-90">
                Encontre serviços duplicados e subutilizados
              </span>
            </Button>

            <Button
              onClick={() => handleAnalyze('cut-planner')}
              disabled={loading !== null || activeExpenses.length === 0}
              variant="outline"
              className="h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span className="font-semibold">Planejador de Cortes</span>
              </div>
              <span className="text-xs text-left mt-1 opacity-90">
                Crie planos para reduzir gastos
              </span>
            </Button>

            <Button
              onClick={() => handleAnalyze('negotiation')}
              disabled={loading !== null || activeExpenses.length === 0}
              variant="ghost"
              className="h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold">Assistente de Negociação</span>
              </div>
              <span className="text-xs text-left mt-1 opacity-90">
                Roteiro para renegociar contratos
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Analisando seus gastos...</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisType === 'optimization' && (
                <div>
                  {analysisResult.avaliacaoGeral && (
                    <div className="mb-4 p-4 rounded-lg bg-muted">
                      <h3 className="font-semibold mb-2">Avaliação Geral</h3>
                      <p>Status: {analysisResult.avaliacaoGeral.status}</p>
                      <p>Percentual Ideal: {analysisResult.avaliacaoGeral.percentualIdeal}%</p>
                      <p>Percentual Real: {analysisResult.avaliacaoGeral.percentualReal}%</p>
                    </div>
                  )}
                  {analysisResult.top3Otimizacoes && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Top 3 Otimizações</h3>
                      <ul className="space-y-2">
                        {analysisResult.top3Otimizacoes.map((opt: any, idx: number) => (
                          <li key={idx} className="p-3 rounded-lg border">
                            <div className="font-medium">{opt.descricao}</div>
                            <div className="text-sm text-muted-foreground">
                              Economia: {formatCurrency(opt.economiaPotencial)} • Prioridade: {opt.prioridade}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.economiaAnualPotencial && (
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="font-semibold">
                        Economia Anual Potencial: {formatCurrency(analysisResult.economiaAnualPotencial)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {analysisType === 'waste' && analysisResult.desperdicios && (
                <div>
                  <h3 className="font-semibold mb-4">Desperdícios Encontrados</h3>
                  <div className="space-y-3">
                    {analysisResult.desperdicios.map((waste: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="font-medium">{waste.nomeGasto}</div>
                        <div className="text-sm text-muted-foreground mt-1">{waste.problema}</div>
                        <div className="mt-2">
                          <Badge variant="secondary">
                            Economia: {formatCurrency(waste.economiaPotencial)}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm">{waste.acaoRecomendada}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisType === 'cut-planner' && analysisResult.planos && (
                <div>
                  <h3 className="font-semibold mb-4">Planos de Corte</h3>
                  <div className="space-y-4">
                    {analysisResult.planos.map((plan: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize">{plan.nivel}</h4>
                          <Badge variant="default">
                            Economia: {formatCurrency(plan.economiaTotal)}/mês
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{plan.descricao}</p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Itens a cortar:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {plan.itens.map((item: string, itemIdx: number) => (
                              <li key={itemIdx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisType === 'negotiation' && analysisResult.roteiro && (
                <div>
                  <h3 className="font-semibold mb-4">Roteiro de Negociação</h3>
                  {analysisResult.roteiro.metaReducao && (
                    <div className="mb-4 p-3 rounded-lg bg-muted">
                      <p className="font-medium">
                        Meta de Redução: {formatCurrency(analysisResult.roteiro.metaReducao)}
                      </p>
                    </div>
                  )}
                  {analysisResult.roteiro.argumentos && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Argumentos:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysisResult.roteiro.argumentos.map((arg: string, idx: number) => (
                          <li key={idx}>{arg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.roteiro.scriptConversa && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Script de Conversa:</h4>
                      <div className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                        {analysisResult.roteiro.scriptConversa}
                      </div>
                    </div>
                  )}
                  {analysisResult.roteiro.precosConcorrentes && (
                    <div>
                      <h4 className="font-medium mb-2">Preços Concorrentes:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {analysisResult.roteiro.precosConcorrentes.map((price: string, idx: number) => (
                          <li key={idx}>{price}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {analysisResult.raw && (
                <div className="p-4 rounded-lg bg-muted">
                  <pre className="whitespace-pre-wrap text-sm">{analysisResult.raw}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

