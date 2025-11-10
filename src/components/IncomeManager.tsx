import { useState } from 'react'
import { useExpenseStore } from '../store/expenseStore'
import { Income } from '../types'
import { formatCurrency } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Edit, Trash2, Plus } from 'lucide-react'
import { IncomeForm } from './IncomeForm'

export function IncomeManager() {
  const { incomes, deleteIncome, getCurrentMonthIncome, getCurrentMonth: getCurrentMonthFromStore } = useExpenseStore()
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const currentMonth = getCurrentMonthFromStore()
  const currentMonthIncome = getCurrentMonthIncome()
  const currentMonthIncomes = incomes.filter((inc) => inc.month === currentMonth)

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta renda?')) {
      deleteIncome(id)
    }
  }

  const handleNewIncome = () => {
    setEditingIncome(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Renda do Mês Atual</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(currentMonthIncome)}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNewIncome} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Renda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendas Cadastradas ({currentMonth})</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthIncomes.length > 0 ? (
            <div className="space-y-2">
              {currentMonthIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{income.source}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(income.amount)} • {income.month}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(income)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(income.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma renda cadastrada para este mês. Clique em "Nova Renda" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      <IncomeForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingIncome(null)
        }}
        income={editingIncome}
      />
    </div>
  )
}

