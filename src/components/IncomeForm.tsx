import { useState, useEffect } from 'react'
import { Income } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog'
import { useExpenseStore } from '../store/expenseStore'

interface IncomeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  income?: Income | null
}

export function IncomeForm({ open, onOpenChange, income }: IncomeFormProps) {
  const { addIncome, updateIncome, getCurrentMonth } = useExpenseStore()
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    month: getCurrentMonth(),
  })

  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount.toString(),
        source: income.source,
        month: income.month,
      })
    } else {
      setFormData({
        amount: '',
        source: '',
        month: getCurrentMonth(),
      })
    }
  }, [income, open, getCurrentMonth])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const incomeData = {
      amount: parseFloat(formData.amount),
      source: formData.source,
      month: formData.month,
    }

    if (income) {
      updateIncome(income.id, incomeData)
    } else {
      addIncome(incomeData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{income ? 'Editar Renda' : 'Nova Renda'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fonte *</label>
            <Input
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              required
              placeholder="Ex: Salário, Freelance, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mês (YYYY-MM) *</label>
            <Input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

