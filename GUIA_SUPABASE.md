# 🚀 Guia Completo de Configuração do Supabase para SGO

## Passo 1: Criar Conta no Supabase

1. **Acesse**: https://supabase.com
2. **Clique em**: "Start your project"
3. **Faça login** com GitHub, Google ou email
4. **Crie uma nova organização** (se necessário)

## Passo 2: Criar Novo Projeto

1. **Clique em**: "New Project"
2. **Preencha**:
   - **Name**: `SGO Sistema Orçamentos`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a mais próxima (ex: South America)
   - **Pricing Plan**: Free (suficiente para começar)
3. **Clique em**: "Create new project"
4. **Aguarde** ~2 minutos para o projeto ser criado

## Passo 3: Configurar o Banco de Dados

### 3.1 Acessar o SQL Editor
1. No painel do Supabase, clique em **"SQL Editor"** (ícone </> na lateral)
2. Clique em **"New query"**

### 3.2 Executar o Script de Configuração
1. **Copie todo o conteúdo** do arquivo `supabase-setup.sql` que criei
2. **Cole no editor SQL** do Supabase
3. **Clique em "Run"** (botão play ▶️)
4. **Aguarde** a execução (deve aparecer "Success" em verde)

### 3.3 Verificar se as Tabelas foram Criadas
1. Clique em **"Table Editor"** na lateral
2. Você deve ver as tabelas:
   - `tasks` (tarefas)
   - `items` (itens)
   - `budgets` (orçamentos)
   - `csus` (casos de uso)
   - `item_tasks` (associações)
   - `csu_items` e `csu_tasks`

## Passo 4: Configurar Autenticação

### 4.1 Habilitar Autenticação por Email
1. Clique em **"Authentication"** na lateral
2. Vá em **"Settings"**
3. Em **"Auth Providers"**, certifique-se que **Email** está habilitado
4. Configure:
   - **Enable email confirmations**: ✅ Habilitado
   - **Enable email change confirmations**: ✅ Habilitado

### 4.2 Configurar URLs (Opcional para desenvolvimento)
Em **"URL Configuration"**:
- **Site URL**: `http://localhost:5173` (para desenvolvimento)
- **Redirect URLs**: `http://localhost:5173/**`

## Passo 5: Obter as Credenciais

### 5.1 Pegar as Chaves da API
1. Clique em **"Settings"** na lateral
2. Clique em **"API"**
3. **Anote estas informações**:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **Project API Key (anon public)**: `eyJhbGc...` (chave longa)

## Passo 6: Configurar o Projeto SGO

### 6.1 Criar Arquivo de Ambiente
1. **Acesse seu projeto SGO** no computador
2. **Crie um arquivo** `.env.local` na raiz do projeto
3. **Adicione as credenciais**:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Atualizar o Arquivo de Configuração
O arquivo `src/lib/supabase.js` já está configurado para usar essas variáveis!

## Passo 7: Testar a Conexão

### 7.1 Executar o Projeto Localmente
```bash
cd sgo-moderno
pnpm run dev
```

### 7.2 Verificar se Funciona
1. **Abra**: http://localhost:5173
2. **Tente criar uma tarefa** - deve salvar no banco
3. **Verifique no Supabase**: Vá em "Table Editor" > "tasks" para ver os dados

## Passo 8: Deploy em Produção

### 8.1 Configurar Variáveis no Deploy
Se você fez deploy (Vercel, Netlify, etc.), adicione as variáveis de ambiente:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 8.2 Atualizar URLs de Produção
No Supabase, em Authentication > Settings:
- **Site URL**: `https://seu-dominio.vercel.app`
- **Redirect URLs**: `https://seu-dominio.vercel.app/**`

## 🔧 Resolução de Problemas Comuns

### ❌ Erro: "Invalid API key"
- Verifique se copiou a chave `anon public` corretamente
- Certifique-se que o arquivo `.env.local` está na raiz do projeto

### ❌ Erro: "Row Level Security"
- O script já configura RLS automaticamente
- Se der erro, execute as políticas manualmente no SQL Editor

### ❌ Erro: "CORS"
- Adicione seu domínio nas configurações de CORS do Supabase
- Vá em Settings > API > CORS Origins

### ❌ Tabelas não aparecem
- Verifique se o script SQL foi executado completamente
- Procure por erros na aba "Logs" do Supabase

## 📊 Monitoramento

### Verificar Uso
- **Dashboard**: Mostra estatísticas de uso
- **Logs**: Mostra erros e queries
- **Auth**: Mostra usuários cadastrados

### Limites do Plano Free
- **Database**: 500MB
- **Auth users**: 50,000
- **API requests**: 500,000/mês
- **Bandwidth**: 5GB/mês

## 🎯 Próximos Passos

1. ✅ **Configure o Supabase** (seguindo este guia)
2. ✅ **Teste localmente** com dados reais
3. ✅ **Configure o deploy** com as variáveis corretas
4. 🚀 **Use o SGO** para seus projetos!

## 📞 Suporte

Se tiver problemas:
1. **Verifique os logs** no Supabase
2. **Teste as queries** no SQL Editor
3. **Confirme as variáveis** de ambiente
4. **Verifique a documentação** do Supabase: https://supabase.com/docs

---

**🎉 Pronto! Seu SGO estará funcionando com banco de dados real e autenticação!**
