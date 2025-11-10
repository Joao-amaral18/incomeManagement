# Sistema de Gerenciamento de Despesas Fixas Mensais

Sistema completo para cadastro, controle e otimização de gastos recorrentes com suporte de IA.

## 🚀 Funcionalidades

### Cadastro de Gastos
- ✅ Criar, editar e excluir gastos
- ✅ Campos obrigatórios: Nome, Valor, Dia de vencimento, Categoria
- ✅ Campos opcionais: Forma de pagamento, Observações, Data de término
- ✅ Marcar como pago no mês
- ✅ Ativar/desativar temporariamente

### Visualizações
- ✅ Dashboard com total mensal e gráficos
- ✅ Lista de gastos agrupados por categoria
- ✅ Próximos vencimentos (7 dias)
- ✅ Distribuição por categoria (gráficos)

### Categorias
- Assinaturas (streaming, apps, etc)
- Educação
- Moradia (aluguel, contas)
- Transporte
- Saúde
- Outros

### Alertas e Notificações
- ✅ 7 dias antes do vencimento
- ✅ 3 dias antes do vencimento
- ✅ No dia do vencimento

### Análises com IA (GEMINI API)
- ✅ Análise de Otimização
- ✅ Detector de Desperdícios
- ✅ Planejador de Cortes
- ✅ Assistente de Negociação

### Gerenciamento de Renda
- ✅ Cadastrar rendas mensais
- ✅ Múltiplas fontes de renda
- ✅ Cálculo automático de saldo
- ✅ Integração com análises de IA

### Autenticação (Clerk)
- ✅ Login e cadastro seguro
- ✅ Proteção de rotas
- ✅ Gerenciamento de usuário

### Armazenamento (Supabase Storage)
- ✅ Armazenamento na nuvem com Supabase Storage
- ✅ Dados isolados por usuário
- ✅ Fallback automático para localStorage
- ✅ Sincronização automática

## 🛠️ Tecnologias

- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **Gráficos:** Recharts
- **Estado:** Zustand
- **IA:** GEMINI API
- **Autenticação:** Clerk
- **Storage:** Supabase Storage (com fallback para localStorage)
- **Build:** Vite

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env na raiz do projeto
VITE_GEMINI_API_KEY=sua_chave_api_aqui
VITE_CLERK_PUBLISHABLE_KEY=sua_chave_clerk_aqui
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_supabase
```

3. Execute o projeto:
```bash
npm run dev
```

## 🔑 Configuração de APIs

### GEMINI API
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova chave de API
3. Adicione no arquivo `.env` como `VITE_GEMINI_API_KEY`

### Clerk Authentication
1. Acesse [Clerk Dashboard](https://dashboard.clerk.com)
2. Crie uma nova aplicação
3. Copie a **Publishable Key**
4. Adicione no arquivo `.env` como `VITE_CLERK_PUBLISHABLE_KEY`

### Supabase Storage
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto (ou use um existente)
3. Vá em **Settings** > **API**
4. Copie a **URL** do projeto e adicione como `VITE_SUPABASE_URL`
5. Copie a **anon/public key** e adicione como `VITE_SUPABASE_ANON_KEY`
6. **Configure o bucket e políticas RLS** - Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para instruções detalhadas
   - Crie o bucket `expense-manager-data` manualmente
   - Configure as políticas RLS necessárias

## 📱 Uso

1. **Autenticação:** Faça login ou crie uma conta para acessar o sistema
2. **Dashboard:** Visualize renda, despesas, saldo, gráficos e próximos vencimentos
3. **Gastos:** Gerencie seus gastos fixos (criar, editar, excluir, marcar como pago)
4. **Renda:** Cadastre suas fontes de renda mensais
5. **Análise IA:** Use as ferramentas de IA para otimizar seus gastos (usa renda cadastrada)
6. **Notificações:** Acompanhe alertas de vencimento

## 💾 Persistência

Os dados são salvos automaticamente usando **Supabase Storage** quando o usuário está autenticado. Cada usuário tem seus próprios dados isolados na nuvem. Se o Supabase não estiver configurado ou houver erro, o sistema faz fallback automático para `localStorage` do navegador.

### Vantagens do Supabase Storage:
- ✅ Dados sincronizados na nuvem
- ✅ Acesso de qualquer dispositivo
- ✅ Backup automático
- ✅ Dados isolados por usuário

## 🎨 Dark Mode

Clique no ícone de sol/lua no header para alternar entre modo claro e escuro.

## 🚀 Deploy

Para fazer deploy gratuito deste projeto, consulte o guia completo em [deploy.md](./deploy.md).

## 📝 Notas

- Os dados são armazenados na nuvem (Supabase) ou localmente (localStorage)
- As análises de IA requerem conexão com a internet
- O sistema verifica notificações automaticamente a cada minuto

