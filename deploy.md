# 🚀 Guia de Deploy Gratuito

Este guia mostra como fazer deploy gratuito deste projeto para uso pessoal.

## 📋 Opções de Deploy Gratuito

### 1. **Vercel** (Recomendado) ⭐

**Vantagens:**
- ✅ Deploy automático via GitHub
- ✅ Suporte nativo a Vite/React
- ✅ HTTPS e CDN global incluídos
- ✅ Planos gratuitos generosos

**Passos:**

1. **Preparar o repositório:**
```bash
git init
git add .
git commit -m "Initial commit"
# Criar repositório no GitHub e fazer push
```

2. **Deploy na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte sua conta GitHub
   - Clique em "Add New Project"
   - Importe seu repositório
   - Configure as variáveis de ambiente:
     - `VITE_GEMINI_API_KEY`
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy automático!

3. **Configurações do Build:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

---

### 2. **Netlify**

**Vantagens:**
- ✅ Deploy contínuo
- ✅ Formulários e funções serverless
- ✅ Interface simples

**Passos:**

1. **Preparar o repositório** (mesmo processo acima)

2. **Deploy na Netlify:**
   - Acesse [netlify.com](https://netlify.com)
   - Conecte sua conta GitHub
   - "Add new site" > "Import an existing project"
   - Selecione o repositório
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Adicione as variáveis de ambiente em **Site settings > Environment variables**
   - Deploy!

---

### 3. **Cloudflare Pages**

**Vantagens:**
- ✅ CDN global
- ✅ Deploy rápido
- ✅ Integração com GitHub

**Passos:**

1. **Preparar o repositório** (mesmo processo)

2. **Deploy no Cloudflare:**
   - Acesse [pages.cloudflare.com](https://pages.cloudflare.com)
   - Conecte sua conta GitHub
   - "Create a project" > "Connect to Git"
   - Selecione o repositório
   - Configure:
     - Framework preset: **Vite**
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Adicione as variáveis de ambiente
   - Deploy!

---

## ✅ Checklist Antes do Deploy

### 1. **Variáveis de Ambiente**
Configure no painel da plataforma escolhida:
```
VITE_GEMINI_API_KEY=...
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 2. **Configurar Clerk**
- No **Clerk Dashboard**, adicione a URL de produção em **Allowed Origins**
- Exemplo: `https://seu-app.vercel.app`

### 3. **Configurar Supabase**
- No **Supabase Dashboard**, adicione a URL de produção em **Authentication > URL Configuration**
- Exemplo: `https://seu-app.vercel.app`

### 4. **Criar arquivo `.gitignore`**
Certifique-se de que `.env` está no `.gitignore`:
```
.env
.env.local
node_modules
dist
```

---

## 📊 Limites dos Planos Gratuitos

### Vercel
- ✅ 100GB bandwidth/mês
- ✅ Deploys ilimitados
- ✅ Domínio personalizado gratuito
- ✅ **Perfeito para uso pessoal**

### Netlify
- ✅ 100GB bandwidth/mês
- ✅ 300 minutos de build/mês
- ✅ Domínio personalizado gratuito
- ✅ **Perfeito para uso pessoal**

### Cloudflare Pages
- ✅ Deploys ilimitados
- ✅ Bandwidth ilimitado
- ✅ Domínio personalizado gratuito
- ✅ **Perfeito para uso pessoal**

### Serviços Externos (já gratuitos)
- **Clerk**: Até 10.000 MAU (Monthly Active Users)
- **Supabase**: 500MB database, 1GB storage, 2GB bandwidth
- **Gemini API**: Verifique os limites no Google AI Studio

---

## 🎯 Recomendação Final

**Use Vercel** porque:
1. ✅ Integração simples com GitHub
2. ✅ Deploy automático a cada push
3. ✅ Preview de PRs
4. ✅ Configuração rápida
5. ✅ Suporte nativo a Vite/React

---

## 🚀 Passo a Passo Rápido (Vercel)

1. **Push para GitHub:**
```bash
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

2. **Vercel:**
   - Login com GitHub
   - "New Project" > Importar repositório
   - Adicionar variáveis de ambiente
   - Deploy!

3. **Configurar URLs:**
   - Clerk: adicionar URL do Vercel
   - Supabase: adicionar URL do Vercel

4. **Pronto!** 🎉 Sua aplicação estará no ar.

---

## 🌐 Dica Extra: Domínio Personalizado

Todas as plataformas permitem domínio personalizado no plano gratuito:
- **Vercel**: Settings > Domains
- **Netlify**: Domain settings > Add custom domain
- **Cloudflare**: Custom domains

---

## 📝 Notas Importantes

- ⚠️ **Nunca commite** arquivos `.env` no Git
- ✅ Sempre use variáveis de ambiente nas plataformas
- ✅ Configure as URLs de produção nos serviços externos
- ✅ Teste localmente antes de fazer deploy
- ✅ Monitore o uso dos planos gratuitos

---

## 🆘 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Execute `npm run build` localmente primeiro
- Verifique os logs de build na plataforma

### Variáveis de Ambiente não funcionam
- Certifique-se de que começam com `VITE_`
- Reinicie o deploy após adicionar variáveis
- Verifique se não há espaços extras

### Erro de CORS no Clerk/Supabase
- Adicione a URL de produção nos serviços
- Verifique se a URL está correta (com https)
- Aguarde alguns minutos para propagação

---

## 📚 Links Úteis

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Supabase Dashboard](https://supabase.com/dashboard)

