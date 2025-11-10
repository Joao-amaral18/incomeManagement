import { useExpenseStore } from '../store/expenseStore'
import { formatCurrency, getCategoryLabel, getDaysUntilDue } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Renda Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Renda do mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Despesas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{formatCurrency(total)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Total de despesas fixas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado para exibir
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado para exibir
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Vencimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos 7 Vencimentos
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
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{expense.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(expense.value)} • Dia {expense.dueDay}
                      </div>
                    </div>
                    <Badge
                      variant={daysUntil === 0 ? 'destructive' : daysUntil <= 3 ? 'default' : 'secondary'}
                    >
                      {daysUntil === 0 ? 'Hoje' : `${daysUntil} dias`}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Nenhum vencimento nos próximos 7 dias
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão Novo Gasto */}
      <div className="flex justify-center">
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          Novo Gasto
        </Button>
      </div>

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}

