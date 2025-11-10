import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export function Auth() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">💰 Gerenciador de Despesas Fixas</CardTitle>
              <CardDescription className="text-center">
                Faça login para gerenciar suas despesas e otimizar seus gastos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <SignInButton mode="modal">
                  <Button className="w-full" size="lg">
                    Entrar
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full" variant="outline" size="lg">
                    Criar Conta
                  </Button>
                </SignUpButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </>
  )
}

