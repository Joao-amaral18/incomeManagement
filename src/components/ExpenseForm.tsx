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
    dueDate: '',
    category: 'outros' as Category,
    paymentMethod: '',
    notes: '',
    endDate: '',
    isActive: true,
  })

  useEffect(() => {
    if (expense) {
      // Convert dueDay (1-31) to a date string (YYYY-MM-DD format with current/next month)
      let dueDateString = ''
      if (expense.dueDay) {
        const today = new Date()
        let dueDate = new Date(today.getFullYear(), today.getMonth(), expense.dueDay)
        
        // If the day has passed this month, use next month
        if (dueDate < today) {
          dueDate = new Date(today.getFullYear(), today.getMonth() + 1, expense.dueDay)
        }
        
        dueDateString = dueDate.toISOString().split('T')[0]
      }
      
      setFormData({
        name: expense.name,
        value: expense.value.toString(),
        dueDate: dueDateString,
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
        dueDate: '',
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
    
    // Generate an ID for name if not provided
    const nameValue = formData.name.trim() || `Expense-${Date.now().toString(36)}`
    
    // Extract day from dueDate if provided
    let dueDay: number | undefined
    if (formData.dueDate) {
      const date = new Date(formData.dueDate)
      dueDay = date.getDate()
    }
    
    const expenseData = {
      name: nameValue,
      value: parseFloat(formData.value),
      dueDay: dueDay,
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
            <label className="block text-xs font-medium mb-1.5">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Netflix (optional - will generate ID if empty)"
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
            <label className="block text-xs font-medium mb-1.5">Due Date</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              placeholder="Select a due date (optional)"
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

