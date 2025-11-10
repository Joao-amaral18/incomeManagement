import { useState, useEffect } from 'react'
import { Expense, Category } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog'
import { useExpenseStore } from '../store/expenseStore'

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
}

const CATEGORIES: Category[] = ['assinaturas', 'educacao', 'moradia', 'transporte', 'saude', 'outros']

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useExpenseStore()
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    dueDay: '',
    category: 'outros' as Category,
    paymentMethod: '',
    notes: '',
    endDate: '',
    isActive: true,
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        value: expense.value.toString(),
        dueDay: expense.dueDay.toString(),
        category: expense.category,
        paymentMethod: expense.paymentMethod || '',
        notes: expense.notes || '',
        endDate: expense.endDate || '',
        isActive: expense.isActive,
      })
    } else {
      setFormData({
        name: '',
        value: '',
        dueDay: '',
        category: 'outros',
        paymentMethod: '',
        notes: '',
        endDate: '',
        isActive: true,
      })
    }
  }, [expense, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const expenseData = {
      name: formData.name,
      value: parseFloat(formData.value),
      dueDay: parseInt(formData.dueDay),
      category: formData.category,
      paymentMethod: formData.paymentMethod || undefined,
      notes: formData.notes || undefined,
      endDate: formData.endDate || undefined,
      isActive: formData.isActive,
    }

    if (expense) {
      updateExpense(expense.id, expenseData)
    } else {
      addExpense(expenseData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Gasto' : 'Novo Gasto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da despesa *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Netflix"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dia do vencimento (1-31) *</label>
            <Input
              type="number"
              min="1"
              max="31"
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
              required
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria *</label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Forma de pagamento</label>
            <Input
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="Ex: Cartão de crédito"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionais"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data de término</label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Ativo
            </label>
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

