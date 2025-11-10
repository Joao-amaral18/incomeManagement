import { useState } from 'react'
import { Expense, PurchaseGoalAIAnalysis, SavingsPlan } from '../../../types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

export function useAIAnalysis() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSavingsPlan = async (
    plan: SavingsPlan,
    expenses: Expense[],
    monthlyIncome: number,
    fixedExpenses: number,
    variableExpenses: number
  ): Promise<PurchaseGoalAIAnalysis | null> => {
    if (!GEMINI_API_KEY) {
      setError('GEMINI_API_KEY não configurada')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const expensesList = expenses
        .filter((exp) => exp.isActive)
        .map((exp) => `- ${exp.name}: R$ ${exp.value.toFixed(2)} (${exp.category})`)
        .join('\n')

      const prompt = `
Analise este planejamento de compra:

DADOS DO USUÁRIO:
- Renda mensal: R$ ${monthlyIncome.toFixed(2)}
- Gastos fixos: R$ ${fixedExpenses.toFixed(2)}
- Gastos variáveis (média): R$ ${variableExpenses.toFixed(2)}
- Sobra mensal: R$ ${plan.monthlySurplus.toFixed(2)}

META:
- Item desejado: ${plan.item}
- Valor: R$ ${plan.targetAmount.toFixed(2)}
- Tempo calculado: ${plan.monthsNeeded} meses
- Valor mensal a guardar: R$ ${plan.monthlySaving.toFixed(2)}

GASTOS FIXOS ATUAIS:
${expensesList || 'Nenhum gasto fixo cadastrado'}

Por favor, forneça uma análise completa em formato JSON válido:

{
  "viability": {
    "isRealistic": boolean,
    "successProbability": number (0-100),
    "risks": ["risco 1", "risco 2"],
    "reasoning": "explicação detalhada",
    "suggestedAmount": number (opcional),
    "alternatives": ["alternativa 1", "alternativa 2"] (opcional)
  },
  "accelerationOptions": [
    {
      "scenario": "light",
      "monthsReduced": number,
      "additionalMonthlySaving": number,
      "suggestions": ["sugestão 1", "sugestão 2"],
      "description": "descrição do cenário"
    },
    {
      "scenario": "moderate",
      "monthsReduced": number,
      "additionalMonthlySaving": number,
      "suggestions": ["sugestão 1", "sugestão 2"],
      "description": "descrição do cenário"
    },
    {
      "scenario": "intense",
      "monthsReduced": number,
      "additionalMonthlySaving": number,
      "suggestions": ["sugestão 1", "sugestão 2"],
      "description": "descrição do cenário"
    }
  ],
  "tips": ["dica 1", "dica 2", "dica 3"]
}

Responda APENAS com o JSON válido, sem markdown ou texto adicional.
`

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data: GeminiResponse = await response.json()
      const text = data.candidates[0]?.content?.parts[0]?.text || ''

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta da IA não contém JSON válido')
      }

      const analysis = JSON.parse(jsonMatch[0])

      const result: PurchaseGoalAIAnalysis = {
        goalId: '', // Will be set when saving
        viability: {
          isRealistic: analysis.viability?.isRealistic ?? true,
          successProbability: analysis.viability?.successProbability ?? 70,
          risks: analysis.viability?.risks ?? [],
          reasoning: analysis.viability?.reasoning || 'Análise não disponível',
          suggestedAmount: analysis.viability?.suggestedAmount,
          alternatives: analysis.viability?.alternatives,
        },
        accelerationOptions: analysis.accelerationOptions?.map((opt: any) => ({
          scenario: opt.scenario || 'light',
          monthsReduced: opt.monthsReduced || 0,
          additionalMonthlySaving: opt.additionalMonthlySaving || 0,
          suggestions: opt.suggestions || [],
          description: opt.description || '',
        })) || [],
        tips: analysis.tips || [],
        generatedAt: new Date().toISOString(),
      }

      return result
    } catch (err: any) {
      console.error('Error calling Gemini API:', err)
      setError(err.message || 'Erro ao analisar com IA')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeSavingsPlan,
    loading,
    error,
  }
}

