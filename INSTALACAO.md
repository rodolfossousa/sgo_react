# 🚀 SGO - Instruções de Instalação

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **pnpm** (recomendado) ou npm
- **Conta no Supabase** (gratuita)

## 🔧 Instalação

### 1. Instalar dependências
```bash
# Usando pnpm (recomendado)
pnpm install

# OU usando npm
npm install
```

### 2. Configurar Supabase
1. **Execute o script SQL**: Copie o conteúdo de `supabase-setup.sql` e execute no SQL Editor do Supabase
2. **Obtenha as credenciais**: Vá em Settings > API no Supabase
3. **Configure as variáveis**: Copie `.env.example` para `.env.local` e preencha com suas credenciais

### 3. Executar o projeto
```bash
# Desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview do build
pnpm run preview
```

## 📁 Estrutura do Projeto

```
sgo/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI
│   │   ├── HomePage.jsx    # Página inicial
│   │   ├── TasksPage.jsx   # Gerenciamento de tarefas
│   │   ├── ItemsPage.jsx   # Gerenciamento de itens
│   │   ├── BudgetsPage.jsx # Gerenciamento de orçamentos
│   │   └── Navigation.jsx  # Navegação
│   ├── lib/                # Utilitários
│   │   ├── supabase.js    # Configuração Supabase
│   │   ├── store.js       # Estado global
│   │   └── api.js         # Funções de API
│   └── App.jsx            # Componente principal
├── public/                 # Arquivos estáticos
├── supabase-setup.sql     # Script do banco
├── .env.example           # Exemplo de variáveis
└── README.md              # Documentação

```

## 🔑 Configuração das Variáveis

Crie o arquivo `.env.local` com:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📚 Documentação Adicional

- **README.md**: Documentação completa do projeto
- **GUIA_SUPABASE.md**: Guia detalhado de configuração do Supabase
- **PASSOS_4_E_5_DETALHADOS.md**: Instruções específicas para autenticação e API

## 🚀 Deploy

O projeto está pronto para deploy em:
- Vercel
- Netlify
- Railway
- Render

### Deploy na Vercel
```bash
npm i -g vercel
vercel --prod
```

## ❓ Problemas Comuns

1. **Erro de dependências**: Execute `pnpm install` ou `npm install`
2. **Erro de Supabase**: Verifique as credenciais no `.env.local`
3. **Erro de build**: Certifique-se que todas as dependências estão instaladas

## 📞 Suporte

Consulte os arquivos de documentação incluídos para instruções detalhadas.

---

**🎯 SGO - Sistema de Gerenciamento de Orçamentos**
*Desenvolvido com React, Tailwind CSS e Supabase*
