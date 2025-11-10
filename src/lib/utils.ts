import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    assinaturas: 'Assinaturas',
    educacao: 'Educação',
    moradia: 'Moradia',
    transporte: 'Transporte',
    saude: 'Saúde',
    outros: 'Outros',
  }
  return labels[category] || category
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    assinaturas: '🎵',
    educacao: '🎓',
    moradia: '🏠',
    transporte: '🚗',
    saude: '🏥',
    outros: '📦',
  }
  return icons[category] || '📦'
}

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  let dueDate = new Date(currentYear, currentMonth, dueDay)
  
  // Se o dia de vencimento já passou este mês, considerar o próximo mês
  if (dueDay < currentDay) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay)
  }
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

export function getNextDueDate(dueDay: number): Date {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  let dueDate = new Date(currentYear, currentMonth, dueDay)
  
  if (dueDay < currentDay) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay)
  }
  
  return dueDate
}

