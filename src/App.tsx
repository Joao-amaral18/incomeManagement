import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { useExpenseStore } from './store/expenseStore'
import { Dashboard } from './components/Dashboard'
import { ExpenseList } from './components/ExpenseList'
import { AIAnalysis } from './components/AIAnalysis'
import { Notifications } from './components/Notifications'
import { IncomeManager } from './components/IncomeManager'
import { Auth } from './components/Auth'
import { Button } from './components/ui/button'
import { Moon, Sun, Home, List, Sparkles, Bell, DollarSign } from 'lucide-react'

function App() {
  const { user } = useUser()
  const { loadFromStorage, setUserId, darkMode, toggleDarkMode, notifications } = useExpenseStore()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'income' | 'ai' | 'notifications'>('dashboard')
  const unreadNotifications = notifications.filter((n) => !n.read).length

  useEffect(() => {
    // Update userId in store when user changes
    setUserId(user?.id || null)
    
    // Load data from storage
    if (user?.id) {
      loadFromStorage(user.id)
    } else {
      loadFromStorage()
    }
    // Verificar notificações a cada minuto
    const interval = setInterval(() => {
      useExpenseStore.getState().checkNotifications()
    }, 60000)
    return () => clearInterval(interval)
  }, [loadFromStorage, setUserId, user?.id])

  return (
    <>
      <SignedOut>
        <Auth />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">💰 Gerenciador de Despesas Fixas</h1>
                <div className="flex items-center gap-2">
                  <Auth />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'expenses' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('expenses')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Gastos
            </Button>
            <Button
              variant={activeTab === 'income' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('income')}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Renda
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('ai')}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Análise IA
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notifications')}
              className="flex items-center gap-2 relative"
            >
              <Bell className="h-4 w-4" />
              Notificações
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'expenses' && <ExpenseList />}
            {activeTab === 'income' && <IncomeManager />}
            {activeTab === 'ai' && <AIAnalysis />}
            {activeTab === 'notifications' && <Notifications />}
          </main>

          {/* Footer */}
          <footer className="border-t mt-12 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              Sistema de Gerenciamento de Despesas Fixas • Versão 1.0
            </div>
          </footer>
        </div>
      </SignedIn>
    </>
  )
}

export default App

