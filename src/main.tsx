import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  console.error('VITE_CLERK_PUBLISHABLE_KEY is not set. Please configure it in your .env file.')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>⚠️ Configuração Necessária</h1>
        <p>Por favor, configure VITE_CLERK_PUBLISHABLE_KEY no arquivo .env</p>
        <p>Veja o README.md para instruções</p>
      </div>
    )}
  </React.StrictMode>,
)

