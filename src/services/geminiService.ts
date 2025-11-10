import { Expense, OptimizationSuggestion, WasteDetection, CutPlan } from '../types'

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

export async function analyzeExpenses(expenses: Expense[], monthlyIncome?: number): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada. Configure a variável de ambiente VITE_GEMINI_API_KEY')
  }

  const total = expenses.reduce((sum, exp) => sum + exp.value, 0)
  const expensesList = expenses
    .map((exp) => `- ${exp.name}: R$ ${exp.value.toFixed(2)} (${exp.category})`)
    .join('\n')

  const prompt = `Analise estes gastos fixos mensais:

${expensesList}

Total: R$ ${total.toFixed(2)}/mês
${monthlyIncome ? `Renda: R$ ${monthlyIncome.toFixed(2)}/mês` : ''}

Forneça uma análise em formato JSON com:
1. avaliacaoGeral: { percentualIdeal: number, percentualReal: number, status: string }
2. top3Otimizacoes: Array<{ descricao: string, economiaPotencial: number, prioridade: string }>
3. economiaAnualPotencial: number
4. priorizacaoAcoes: Array<{ acao: string, impacto: string }>

Responda APENAS com o JSON válido, sem markdown.`

  try {
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
    
    // Tenta extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    return text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

export async function detectWaste(expenses: Expense[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada')
  }

  const expensesList = expenses
    .map((exp) => `- ${exp.name}: R$ ${exp.value.toFixed(2)} (${exp.category})`)
    .join('\n')

  const prompt = `Identifique desperdícios nestes gastos fixos:

${expensesList}

Para cada problema encontrado, forneça em formato JSON:
{
  "desperdicios": [
    {
      "nomeGasto": string,
      "problema": string,
      "economiaPotencial": number,
      "acaoRecomendada": string
    }
  ]
}

Responda APENAS com o JSON válido, sem markdown.`

  try {
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
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    return text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

export async function createCutPlans(expenses: Expense[], targetSavings: number): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada')
  }

  const expensesList = expenses
    .map((exp) => `- ${exp.name}: R$ ${exp.value.toFixed(2)} (${exp.category})`)
    .join('\n')

  const prompt = `Meta: reduzir R$ ${targetSavings.toFixed(2)}/mês

Gastos atuais:
${expensesList}

Crie 3 planos em formato JSON:
{
  "planos": [
    {
      "nivel": "suave",
      "itens": ["nome do gasto"],
      "economiaTotal": number,
      "descricao": string
    },
    {
      "nivel": "moderado",
      "itens": ["nome do gasto"],
      "economiaTotal": number,
      "descricao": string
    },
    {
      "nivel": "agressivo",
      "itens": ["nome do gasto"],
      "economiaTotal": number,
      "descricao": string
    }
  ]
}

Responda APENAS com o JSON válido, sem markdown.`

  try {
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
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    return text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

export async function generateNegotiationScript(expense: Expense): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada')
  }

  const prompt = `Gere um roteiro de negociação para reduzir o custo de:

Nome: ${expense.name}
Valor atual: R$ ${expense.value.toFixed(2)}
Categoria: ${expense.category}

Forneça em formato JSON:
{
  "roteiro": {
    "argumentos": ["argumento 1", "argumento 2"],
    "scriptConversa": "texto do script",
    "precosConcorrentes": ["pesquisa de preços"],
    "metaReducao": number
  }
}

Responda APENAS com o JSON válido, sem markdown.`

  try {
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
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    return text
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

