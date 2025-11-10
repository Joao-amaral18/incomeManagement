# 🔧 Configuração do Supabase Storage

Este guia explica como configurar o Supabase Storage para funcionar corretamente com este projeto.

## 📋 Passo a Passo

### 1. Criar o Bucket

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure:
   - **Name**: `expense-manager-data`
   - **Public bucket**: ❌ **Desmarcado** (privado)
   - Clique em **Create bucket**

### 2. Configurar Políticas RLS (Row Level Security)

⚠️ **IMPORTANTE**: Sem as políticas RLS, você receberá erros 400 (permission denied).

#### Opção A: Políticas via SQL Editor (Recomendado)

1. No Supabase Dashboard, vá em **SQL Editor**
2. Execute o seguinte SQL:

```sql
-- Política para permitir que usuários leiam seus próprios arquivos
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expense-manager-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários façam upload de seus próprios arquivos
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expense-manager-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários atualizem seus próprios arquivos
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'expense-manager-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários deletem seus próprios arquivos
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'expense-manager-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Opção B: Políticas via Interface (Alternativa)

⚠️ **Nota**: Como estamos usando Clerk para autenticação (não Supabase Auth), as políticas acima podem não funcionar diretamente. Nesse caso, use a **Opção C**.

#### Opção C: Políticas Simplificadas (Para uso com Clerk)

Se você está usando Clerk para autenticação, você precisa de políticas mais permissivas baseadas no path do arquivo:

```sql
-- Permitir leitura de arquivos no bucket (baseado no path do userId)
CREATE POLICY "Allow read for authenticated paths"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expense-manager-data'
);

-- Permitir upload de arquivos no bucket
CREATE POLICY "Allow insert for authenticated paths"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expense-manager-data'
);

-- Permitir atualização de arquivos no bucket
CREATE POLICY "Allow update for authenticated paths"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'expense-manager-data'
);

-- Permitir deleção de arquivos no bucket
CREATE POLICY "Allow delete for authenticated paths"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'expense-manager-data'
);
```

⚠️ **Atenção**: As políticas acima são mais permissivas. Para produção, você deve implementar validação adicional no backend ou usar Supabase Auth em vez de Clerk.

### 3. Verificar Configuração

1. No Supabase Dashboard, vá em **Storage** > **Policies**
2. Selecione o bucket `expense-manager-data`
3. Verifique se as políticas foram criadas corretamente

## 🔍 Troubleshooting

### Erro 400 (Bad Request)
- ✅ Verifique se o bucket existe
- ✅ Verifique se as políticas RLS estão configuradas
- ✅ Verifique se você está usando a chave `anon` correta (não a `service_role`)

### Erro 404 (Not Found)
- ✅ Isso é **normal** para usuários novos (arquivo ainda não existe)
- ✅ O sistema criará o arquivo automaticamente no primeiro save

### Erro de Permissão
- ✅ Certifique-se de que as políticas RLS estão ativas
- ✅ Verifique se o bucket não está marcado como público (deve ser privado)
- ✅ Tente executar as políticas SQL novamente

## 📝 Notas Importantes

1. **Clerk vs Supabase Auth**: Este projeto usa Clerk para autenticação, mas Supabase Storage espera autenticação do Supabase. As políticas simplificadas (Opção C) funcionam, mas são menos seguras.

2. **Para Produção**: Considere:
   - Usar Supabase Auth em vez de Clerk, OU
   - Criar um backend que valide o userId do Clerk antes de permitir acesso ao Storage, OU
   - Usar Service Role Key no backend (nunca no frontend!)

3. **Segurança**: As políticas da Opção C permitem que qualquer usuário autenticado acesse qualquer arquivo no bucket. Para uso pessoal está OK, mas para produção precisa de validação adicional.

## ✅ Verificação Final

Após configurar, teste:
1. Faça login na aplicação
2. Crie um novo gasto
3. Verifique no console do navegador se não há erros
4. Verifique no Supabase Dashboard > Storage se o arquivo foi criado

Se tudo funcionar, você verá um arquivo em: `expense-manager-data/{userId}/data.json`

