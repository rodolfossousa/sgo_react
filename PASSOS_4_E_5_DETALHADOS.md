# 🔐 Passo 4: Configurar Autenticação (DETALHADO)

## O que é e por que fazer?
A autenticação permite que usuários se cadastrem e façam login no SGO. Cada usuário verá apenas seus próprios orçamentos, tarefas e itens.

## 4.1 Acessar Configurações de Autenticação

### Onde clicar:
1. **No painel lateral esquerdo** do Supabase
2. **Procure o ícone de usuário** 👤 
3. **Clique em "Authentication"**
4. **Depois clique em "Settings"** (dentro de Authentication)

### O que você verá:
- Uma página com várias opções de configuração
- Seções como "General", "Auth Providers", "Email Templates", etc.

## 4.2 Configurar Providers de Autenticação

### Localizar a seção "Auth Providers":
- **Role a página para baixo** até encontrar "Auth Providers"
- Você verá uma lista de opções como:
  - ✅ **Email** (deve estar habilitado por padrão)
  - ❌ Google (desabilitado)
  - ❌ GitHub (desabilitado)
  - ❌ Facebook (desabilitado)

### Verificar se Email está habilitado:
- **Email deve ter um toggle verde** ✅
- Se estiver cinza/desabilitado, **clique no toggle** para habilitar
- **Não precisa configurar Google, GitHub, etc.** - apenas Email é suficiente

## 4.3 Configurar Confirmação de Email

### Encontrar "Email Auth":
- **Na mesma página**, procure por "Email Auth"
- Você verá opções como:

### Configurações recomendadas:
- ✅ **"Enable email confirmations"** - HABILITAR
  - Isso faz com que usuários confirmem o email ao se cadastrar
- ✅ **"Enable email change confirmations"** - HABILITAR  
  - Isso protege quando usuários mudam o email
- ✅ **"Enable phone confirmations"** - PODE DEIXAR DESABILITADO
  - Não vamos usar telefone no SGO

## 4.4 Configurar URLs (Para desenvolvimento local)

### Encontrar "URL Configuration":
- **Role mais para baixo** até "URL Configuration"

### Configurar para desenvolvimento:
- **Site URL**: `http://localhost:5173`
  - Esta é a URL onde seu SGO roda localmente
- **Redirect URLs**: `http://localhost:5173/**`
  - O `/**` permite qualquer página do seu site

### ⚠️ IMPORTANTE:
- **Se você já fez deploy**, adicione também a URL de produção
- Exemplo: `https://seu-sgo.vercel.app`

---

# 🔑 Passo 5: Obter as Credenciais (DETALHADO)

## O que são essas credenciais?
São as "chaves" que permitem seu SGO se conectar ao banco de dados Supabase. É como a senha do banco.

## 5.1 Navegar para Settings > API

### Como chegar lá:
1. **No painel lateral esquerdo**, procure o ícone de engrenagem ⚙️
2. **Clique em "Settings"**
3. **Dentro de Settings**, clique em **"API"**

### O que você verá:
Uma página com várias informações técnicas e duas seções principais:
- **Project URL**
- **Project API keys**

## 5.2 Copiar o Project URL

### Localizar:
- **Procure por "Project URL"** (geralmente no topo)
- Será algo como: `https://abcdefghijk.supabase.co`

### Como copiar:
- **Clique no ícone de copiar** 📋 ao lado da URL
- **OU selecione todo o texto** e Ctrl+C
- **Anote em algum lugar** (bloco de notas, papel, etc.)

### Exemplo do que você vai ver:
```
Project URL
https://xkqpqwerty123.supabase.co
```

## 5.3 Copiar a API Key (anon public)

### Localizar "Project API keys":
- **Role para baixo** até encontrar "Project API keys"
- Você verá **duas chaves diferentes**:

### 🔍 Identificar a chave correta:
- ❌ **service_role** - NÃO use esta (é secreta)
- ✅ **anon public** - USE ESTA (é segura para frontend)

### Como identificar a anon public:
- **Procure por "anon"** ou **"public"** no nome
- Geralmente está **em segundo lugar**
- É uma string **muito longa** que começa com `eyJhbGc...`

### Como copiar:
- **Clique no ícone de copiar** 📋 ao lado da chave
- **OU clique em "Reveal"** se estiver oculta, depois copie
- **Anote junto com a URL**

### Exemplo do que você vai ver:
```
anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXBxd2VydHkxMjMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODgxMCwiZXhwIjoxOTUyMTI0ODEwfQ.abc123def456...
```

## 5.4 Verificar se copiou corretamente

### Checklist das suas credenciais:
- ✅ **URL**: Começa com `https://` e termina com `.supabase.co`
- ✅ **API Key**: É uma string muito longa que começa com `eyJhbGc`
- ✅ **Você copiou a "anon public"**, não a "service_role"

### Exemplo completo:
```
URL: https://xkqpqwerty123.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXBxd2VydHkxMjMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODgxMCwiZXhwIjoxOTUyMTI0ODEwfQ.abc123def456ghi789...
```

---

# ✅ Próximo Passo: Configurar o SGO

Agora que você tem as credenciais, precisa colocá-las no seu projeto SGO:

## Criar arquivo .env.local:
1. **Abra a pasta** do seu projeto SGO
2. **Crie um arquivo** chamado `.env.local`
3. **Cole este conteúdo** (substituindo pelos seus dados):

```env
VITE_SUPABASE_URL=https://SUA_URL_AQUI.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_MUITO_LONGA_AQUI
```

## Exemplo real:
```env
VITE_SUPABASE_URL=https://xkqpqwerty123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrcXBxd2VydHkxMjMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU0ODgxMCwiZXhwIjoxOTUyMTI0ODEwfQ.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

# 🚨 Dicas Importantes:

## ❌ Erros Comuns:
- **Copiar a chave errada** (service_role em vez de anon public)
- **Esquecer o "VITE_"** no início das variáveis
- **Colocar espaços** antes ou depois das credenciais
- **Salvar como .env** em vez de **.env.local**

## ✅ Como saber se deu certo:
- **Execute o SGO** (`pnpm run dev`)
- **Tente criar uma tarefa**
- **Se salvar**, está funcionando!
- **Se der erro**, verifique as credenciais

## 🔒 Segurança:
- **NUNCA compartilhe** a chave service_role
- **A anon public é segura** para usar no frontend
- **O arquivo .env.local** não deve ser commitado no Git

---

**🎯 Resumo: Você precisa de 2 coisas do Supabase:**
1. **URL do projeto** (Settings > API)
2. **Chave anon public** (Settings > API)

**E colocar no arquivo .env.local do seu SGO!**
