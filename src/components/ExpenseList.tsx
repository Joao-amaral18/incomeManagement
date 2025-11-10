import { useExpenseStore } from '../store/expenseStore'
import { Expense } from '../types'
import { formatCurrency, getCategoryLabel, getCategoryIcon, getDaysUntilDue } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Edit, Trash2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { ExpenseForm } from './ExpenseForm'

export function ExpenseList() {
  const { expenses, getExpensesByCategory, deleteExpense, markAsPaid, unmarkAsPaid, isPaidThisMonth } = useExpenseStore()
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const expensesByCategory = getExpensesByCategory()

  const handleNewExpense = () => {
    setEditingExpense(null)
    setIsFormOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este gasto?')) {
      deleteExpense(id)
    }
  }

  const handleTogglePaid = (expense: Expense) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    if (isPaidThisMonth(expense.id)) {
      unmarkAsPaid(expense.id, currentMonth)
    } else {
      markAsPaid(expense.id, currentMonth)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleNewExpense}>Novo Gasto</Button>
      </div>
      
      {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
        if (categoryExpenses.length === 0) return null

        const total = categoryExpenses.reduce((sum, exp) => sum + exp.value, 0)

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {getCategoryIcon(category)} {getCategoryLabel(category)} ({formatCurrency(total)})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryExpenses.map((expense) => {
                  const daysUntil = getDaysUntilDue(expense.dueDay)
                  const paid = isPaidThisMonth(expense.id)
                  
                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        paid ? 'bg-green-50 dark:bg-green-900/20' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{expense.name}</span>
                          {!expense.isActive && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                          {paid && (
                            <Badge variant="default" className="bg-green-600">Pago</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(expense.value)} • Vence dia {expense.dueDay}
                          {daysUntil >= 0 && daysUntil <= 7 && (
                            <span className={`ml-2 ${daysUntil === 0 ? 'text-red-600 font-semibold' : 'text-orange-600'}`}>
                              ({daysUntil === 0 ? 'Vence hoje!' : `${daysUntil} dias`})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTogglePaid(expense)}
                          title={paid ? 'Marcar como não pago' : 'Marcar como pago'}
                        >
                          {paid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {expenses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum gasto cadastrado. Clique em "Novo Gasto" para começar.
          </CardContent>
        </Card>
      )}

      <ExpenseForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingExpense(null)
        }}
        expense={editingExpense}
      />
    </div>
  )
}

