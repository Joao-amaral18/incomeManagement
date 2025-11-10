import { useExpenseStore } from '../store/expenseStore'
import { formatCurrency, getCategoryLabel, getDaysUntilDue } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { TrendingUp, Calendar, Target } from 'lucide-react'
import { useState } from 'react'
import { ExpenseForm } from './ExpenseForm'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function Dashboard() {
  const { getTotalMonthly, getExpensesByCategory, getUpcomingExpenses, getCurrentMonthIncome } = useExpenseStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const total = getTotalMonthly()
  const monthlyIncome = getCurrentMonthIncome()
  const expensesByCategory = getExpensesByCategory()
  const upcomingExpenses = getUpcomingExpenses(7)
  const balance = monthlyIncome - total

  // Dados para gráfico de pizza
  const pieData = Object.entries(expensesByCategory)
    .filter(([_, expenses]) => expenses.length > 0)
    .map(([category, expenses]) => ({
      name: getCategoryLabel(category),
      value: expenses.reduce((sum, exp) => sum + exp.value, 0),
    }))

  // Dados para gráfico de barras
  const barData = Object.entries(expensesByCategory)
    .filter(([_, expenses]) => expenses.length > 0)
    .map(([category, expenses]) => ({
      category: getCategoryLabel(category),
      total: expenses.reduce((sum, exp) => sum + exp.value, 0),
    }))

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-red-600" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-600">{formatCurrency(total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Upcoming Payments (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingExpenses.length > 0 ? (
            <div className="space-y-2">
              {upcomingExpenses.map((expense) => {
                const daysUntil = getDaysUntilDue(expense.dueDay)
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded border"
                  >
                    <div>
                      <div className="text-sm font-medium">{expense.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(expense.value)} • Day {expense.dueDay}
                      </div>
                    </div>
                    <Badge
                      variant={daysUntil === 0 ? 'destructive' : daysUntil <= 3 ? 'default' : 'secondary'}
                    >
                      {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              No upcoming payments in the next 7 days
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          New Expense
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex items-center gap-2"
          title="Acesse via aba 'Planejador' na navegação"
        >
          <Target className="h-4 w-4" />
          Planejador de Compras
        </Button>
      </div>

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}

