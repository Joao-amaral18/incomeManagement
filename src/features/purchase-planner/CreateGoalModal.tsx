import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog'
import { useSavingsPlan } from './hooks/useSavingsPlan'
import { useExpenseStore } from '../../store/expenseStore'

interface CreateGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCalculate: (plan: ReturnType<typeof useSavingsPlan>) => void
}

export function CreateGoalModal({ open, onOpenChange, onCalculate }: CreateGoalModalProps) {
  const { getTotalMonthly, getTotalMonthlyIncome } = useExpenseStore()
  const [item, setItem] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [customMonthlySaving, setCustomMonthlySaving] = useState('')

  const monthlyIncome = getTotalMonthlyIncome()
  const fixedExpenses = getTotalMonthly()
  // Estimate variable expenses as 30% of income if not available
  const averageVariableExpenses = monthlyIncome * 0.3

  const plan = useSavingsPlan(
    item,
    parseFloat(targetAmount) || 0,
    monthlyIncome,
    fixedExpenses,
    averageVariableExpenses,
    customMonthlySaving ? parseFloat(customMonthlySaving) : undefined
  )

  const handleCalculate = () => {
    if (!item.trim() || !targetAmount || parseFloat(targetAmount) < 100) {
      alert('Por favor, preencha o item e um valor mínimo de R$ 100')
      return
    }

    if (!plan) {
      alert('Não foi possível calcular o plano. Verifique sua renda e gastos.')
      return
    }

    // Validations
    if (parseFloat(targetAmount) < 100) {
      alert('Meta deve ser no mínimo R$ 100')
      return
    }

    if (plan.monthsNeeded > 36) {
      const proceed = confirm(
        'Esta meta levará mais de 3 anos. Deseja continuar mesmo assim?'
      )
      if (!proceed) return
    }

    if (plan.monthlySaving > plan.monthlySurplus * 0.8) {
      const proceed = confirm(
        'Você está planejando guardar mais de 80% da sobra. Isso pode ser arriscado. Deseja continuar?'
      )
      if (!proceed) return
    }

    onCalculate(plan)
  }

  const handleClose = () => {
    setItem('')
    setTargetAmount('')
    setCustomMonthlySaving('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogClose onClose={handleClose} />
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            🎯 Planejador de Compras
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              O que você deseja comprar?
            </label>
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="ex: iPhone 15 Pro"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Qual o valor? (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              min="100"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="7.299,00"
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 Deixe a IA calcular quanto você pode guardar por mês
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              OU informe manualmente (opcional):
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={customMonthlySaving}
              onChange={(e) => setCustomMonthlySaving(e.target.value)}
              placeholder="R$ _____ por mês"
              className="w-full"
            />
          </div>

          {plan && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Pré-visualização:
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Tempo estimado: {plan.monthsNeeded} meses
                <br />
                Valor mensal: R$ {plan.monthlySaving.toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} size="sm">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCalculate}
              size="sm"
              disabled={!item.trim() || !targetAmount || !plan}
            >
              Calcular Plano 🤖
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

