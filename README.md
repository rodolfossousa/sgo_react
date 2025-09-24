# SGO - Sistema de Gerenciamento de Orçamentos

Um sistema moderno e intuitivo para gerenciamento de orçamentos de projetos, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

### 📋 Banco de Tarefas
- Cadastro de tarefas com estimativas de tempo por complexidade
- 4 níveis de complexidade: Baixa, Média, Alta e Altíssima
- Interface moderna com badges coloridos para identificação visual
- Busca e filtros avançados

### 📦 Biblioteca de Itens
- Criação de itens reutilizáveis compostos por tarefas
- Associação múltipla de tarefas a itens
- Visualização clara das complexidades disponíveis
- Sistema de busca e seleção intuitivo

### 💰 Gerenciamento de Orçamentos
- Organização hierárquica: Orçamentos → CSUs → Itens/Tarefas
- Interface accordion expansível para navegação
- Cálculo automático de horas estimadas
- Dashboard com estatísticas em tempo real

### 🏠 Dashboard Inteligente
- Visão geral com métricas importantes
- Cards de acesso rápido às funcionalidades
- Estatísticas visuais e indicadores de progresso
- Interface responsiva e moderna

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand
- **Ícones**: Lucide React
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Deploy**: Pronto para deploy

## 🎨 Design System

### Paleta de Cores
- **Primary**: Azul moderno para ações principais
- **Secondary**: Cinza elegante para elementos secundários
- **Success**: Verde para estados positivos
- **Warning**: Amarelo para alertas
- **Error**: Vermelho para erros

### Componentes Modernos
- **ModernCard**: Cards com hover effects e estados
- **ComplexityBadge**: Badges coloridos para complexidades
- **SearchInput**: Busca com ícones e clear button
- **LoadingOverlay**: Estados de carregamento elegantes
- **EmptyState**: Estados vazios informativos

## 📱 Interface Responsiva

- Design mobile-first
- Navegação adaptativa
- Cards responsivos
- Modais otimizados para mobile

## 🔧 Configuração do Projeto

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado)
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd sgo-moderno

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
pnpm run dev
```

### Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute o script SQL para criar as tabelas:

```sql
-- Tabela de tarefas
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  complexity_low TIME,
  complexity_medium TIME,
  complexity_high TIME,
  complexity_very_high TIME,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação item-tarefa
CREATE TABLE item_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de orçamentos
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CSUs (Casos de Uso)
CREATE TABLE csus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens no CSU
CREATE TABLE csu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  csu_id UUID REFERENCES csus(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  calculated_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas no CSU
CREATE TABLE csu_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  csu_id UUID REFERENCES csus(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  calculated_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE csus ENABLE ROW LEVEL SECURITY;
ALTER TABLE csu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE csu_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own items" ON items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own budgets" ON budgets FOR ALL USING (auth.uid() = user_id);
```

3. Atualize o arquivo `src/lib/supabase.js` com suas credenciais

## 📊 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de UI reutilizáveis
│   ├── HomePage.jsx     # Página inicial
│   ├── TasksPage.jsx    # Gerenciamento de tarefas
│   ├── ItemsPage.jsx    # Gerenciamento de itens
│   ├── BudgetsPage.jsx  # Gerenciamento de orçamentos
│   └── Navigation.jsx   # Navegação principal
├── lib/                 # Utilitários e configurações
│   ├── supabase.js     # Configuração do Supabase
│   ├── store.js        # Estado global (Zustand)
│   └── api.js          # Funções de API
└── App.jsx             # Componente principal
```

## 🚀 Deploy

O projeto está pronto para deploy em plataformas como:
- Vercel
- Netlify
- Railway
- Render

### Deploy na Vercel
```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel --prod
```

## 📈 Próximas Funcionalidades

- [ ] Autenticação completa com Supabase Auth
- [ ] Exportação de orçamentos em PDF
- [ ] Relatórios e analytics avançados
- [ ] Colaboração em tempo real
- [ ] Templates de orçamentos
- [ ] Integração com APIs de terceiros
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

---

**SGO** - Transformando a gestão de orçamentos em uma experiência moderna e eficiente.
