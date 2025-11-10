import { useExpenseStore } from '../store/expenseStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, X } from 'lucide-react'
import { format } from 'date-fns'

export function Notifications() {
  const { notifications, markNotificationAsRead, clearNotifications } = useExpenseStore()
  const unreadCount = notifications.filter((n) => !n.read).length

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhuma notificação
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount}</Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearNotifications}>
              Limpar todas
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start justify-between p-3 rounded-lg border ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={notification.read ? 'text-muted-foreground' : 'font-medium'}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <Badge variant="default" className="bg-blue-600">Nova</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(notification.date), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
              {!notification.read && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

