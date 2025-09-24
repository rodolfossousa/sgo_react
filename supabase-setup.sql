-- SGO - Sistema de Gerenciamento de Orçamentos
-- Script de configuração do banco de dados Supabase

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  complexity_low TIME,
  complexity_medium TIME,
  complexity_high TIME,
  complexity_very_high TIME,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação item-tarefa
CREATE TABLE IF NOT EXISTS item_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, task_id)
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CSUs (Casos de Uso)
CREATE TABLE IF NOT EXISTS csus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens no CSU
CREATE TABLE IF NOT EXISTS csu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  csu_id UUID REFERENCES csus(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  calculated_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(csu_id, item_id)
);

-- Tabela de tarefas no CSU
CREATE TABLE IF NOT EXISTS csu_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  csu_id UUID REFERENCES csus(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high', 'very_high')),
  calculated_hours DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(csu_id, task_id)
);

-- Função para converter tempo em formato HH:MM para decimal
CREATE OR REPLACE FUNCTION time_to_decimal(time_value TIME)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF time_value IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN EXTRACT(HOUR FROM time_value) + (EXTRACT(MINUTE FROM time_value) / 60.0);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular horas de uma tarefa baseado na complexidade
CREATE OR REPLACE FUNCTION calculate_task_hours(task_id UUID, complexity_level TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  task_record RECORD;
  hours DECIMAL(10,2) := 0;
BEGIN
  SELECT * INTO task_record FROM tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  CASE complexity_level
    WHEN 'low' THEN
      hours := time_to_decimal(task_record.complexity_low);
    WHEN 'medium' THEN
      hours := time_to_decimal(task_record.complexity_medium);
    WHEN 'high' THEN
      hours := time_to_decimal(task_record.complexity_high);
    WHEN 'very_high' THEN
      hours := time_to_decimal(task_record.complexity_very_high);
    ELSE
      hours := 0;
  END CASE;
  
  RETURN hours;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular horas de um item baseado na complexidade
CREATE OR REPLACE FUNCTION calculate_item_hours(item_id UUID, complexity_level TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_hours DECIMAL(10,2) := 0;
  task_record RECORD;
BEGIN
  FOR task_record IN 
    SELECT t.* FROM tasks t
    INNER JOIN item_tasks it ON it.task_id = t.id
    WHERE it.item_id = item_id
  LOOP
    total_hours := total_hours + calculate_task_hours(task_record.id, complexity_level);
  END LOOP;
  
  RETURN total_hours;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar calculated_hours em csu_items
CREATE OR REPLACE FUNCTION update_csu_item_hours()
RETURNS TRIGGER AS $$
BEGIN
  NEW.calculated_hours := calculate_item_hours(NEW.item_id, NEW.complexity);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar calculated_hours em csu_tasks
CREATE OR REPLACE FUNCTION update_csu_task_hours()
RETURNS TRIGGER AS $$
BEGIN
  NEW.calculated_hours := calculate_task_hours(NEW.task_id, NEW.complexity);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_update_csu_item_hours ON csu_items;
CREATE TRIGGER trigger_update_csu_item_hours
  BEFORE INSERT OR UPDATE ON csu_items
  FOR EACH ROW EXECUTE FUNCTION update_csu_item_hours();

DROP TRIGGER IF EXISTS trigger_update_csu_task_hours ON csu_tasks;
CREATE TRIGGER trigger_update_csu_task_hours
  BEFORE INSERT OR UPDATE ON csu_tasks
  FOR EACH ROW EXECUTE FUNCTION update_csu_task_hours();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_csus_updated_at BEFORE UPDATE ON csus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE csus ENABLE ROW LEVEL SECURITY;
ALTER TABLE csu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE csu_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (usuários só veem seus próprios dados)

-- Políticas para tasks
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para items
DROP POLICY IF EXISTS "Users can manage own items" ON items;
CREATE POLICY "Users can manage own items" ON items
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para item_tasks
DROP POLICY IF EXISTS "Users can manage own item_tasks" ON item_tasks;
CREATE POLICY "Users can manage own item_tasks" ON item_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_tasks.item_id 
      AND items.user_id = auth.uid()
    )
  );

-- Políticas para budgets
DROP POLICY IF EXISTS "Users can manage own budgets" ON budgets;
CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para csus
DROP POLICY IF EXISTS "Users can manage own csus" ON csus;
CREATE POLICY "Users can manage own csus" ON csus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = csus.budget_id 
      AND budgets.user_id = auth.uid()
    )
  );

-- Políticas para csu_items
DROP POLICY IF EXISTS "Users can manage own csu_items" ON csu_items;
CREATE POLICY "Users can manage own csu_items" ON csu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM csus 
      INNER JOIN budgets ON budgets.id = csus.budget_id
      WHERE csus.id = csu_items.csu_id 
      AND budgets.user_id = auth.uid()
    )
  );

-- Políticas para csu_tasks
DROP POLICY IF EXISTS "Users can manage own csu_tasks" ON csu_tasks;
CREATE POLICY "Users can manage own csu_tasks" ON csu_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM csus 
      INNER JOIN budgets ON budgets.id = csus.budget_id
      WHERE csus.id = csu_tasks.csu_id 
      AND budgets.user_id = auth.uid()
    )
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_csus_budget_id ON csus(budget_id);
CREATE INDEX IF NOT EXISTS idx_item_tasks_item_id ON item_tasks(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tasks_task_id ON item_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_csu_items_csu_id ON csu_items(csu_id);
CREATE INDEX IF NOT EXISTS idx_csu_tasks_csu_id ON csu_tasks(csu_id);

-- Inserir dados de exemplo (opcional)
-- Descomente as linhas abaixo se quiser dados de exemplo

/*
-- Exemplo de tarefas
INSERT INTO tasks (description, complexity_low, complexity_medium, complexity_high, complexity_very_high, user_id) VALUES
('Implementar autenticação de usuário', '02:00', '04:00', '08:00', '16:00', auth.uid()),
('Criar interface de dashboard', '01:30', '03:00', '06:00', '12:00', auth.uid()),
('Configurar banco de dados', '01:00', '02:00', '04:00', '08:00', auth.uid()),
('Implementar sistema de notificações', '03:00', '06:00', '12:00', '24:00', auth.uid()),
('Criar relatórios em PDF', '02:30', '05:00', '10:00', '20:00', auth.uid());

-- Exemplo de itens
INSERT INTO items (name, description, user_id) VALUES
('Sistema de Login', 'Módulo completo de autenticação e autorização', auth.uid()),
('Dashboard Administrativo', 'Interface de administração com métricas', auth.uid()),
('Módulo de Relatórios', 'Sistema de geração e exportação de relatórios', auth.uid());
*/

-- Comentários finais
COMMENT ON TABLE tasks IS 'Tabela de tarefas com estimativas por complexidade';
COMMENT ON TABLE items IS 'Tabela de itens reutilizáveis compostos por tarefas';
COMMENT ON TABLE budgets IS 'Tabela de orçamentos de projetos';
COMMENT ON TABLE csus IS 'Tabela de casos de uso (CSUs) dentro dos orçamentos';
COMMENT ON TABLE csu_items IS 'Associação de itens aos CSUs com complexidade específica';
COMMENT ON TABLE csu_tasks IS 'Associação de tarefas individuais aos CSUs com complexidade específica';

-- Finalização
SELECT 'SGO Database setup completed successfully!' as status;
