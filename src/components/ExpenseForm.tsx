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
          <DialogTitle className="text-lg">{expense ? 'Edit Expense' : 'New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Netflix"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Amount (R$) *</label>
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
            <label className="block text-xs font-medium mb-1.5">Due Day (1-31) *</label>
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
            <label className="block text-xs font-medium mb-1.5">Category *</label>
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
            <label className="block text-xs font-medium mb-1.5">Payment Method</label>
            <Input
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="e.g., Credit card"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Notes</label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">End Date</label>
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
              className="rounded w-4 h-4"
            />
            <label htmlFor="isActive" className="text-xs font-medium">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

