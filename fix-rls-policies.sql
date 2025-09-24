-- Script para corrigir políticas RLS com seu usuário real
-- Execute este script no SQL Editor do Supabase

-- Atualizar políticas para permitir inserção com seu UID real
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236'
  );

DROP POLICY IF EXISTS "Users can manage own items" ON items;
CREATE POLICY "Users can manage own items" ON items
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236'
  );

DROP POLICY IF EXISTS "Users can manage own budgets" ON budgets;
CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (
    auth.uid() = user_id OR 
    user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236'
  );

-- Políticas para item_tasks
DROP POLICY IF EXISTS "Users can manage own item_tasks" ON item_tasks;
CREATE POLICY "Users can manage own item_tasks" ON item_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_tasks.item_id 
      AND (items.user_id = auth.uid() OR items.user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236')
    )
  );

-- Políticas para csus
DROP POLICY IF EXISTS "Users can manage own csus" ON csus;
CREATE POLICY "Users can manage own csus" ON csus
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM budgets 
      WHERE budgets.id = csus.budget_id 
      AND (budgets.user_id = auth.uid() OR budgets.user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236')
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
      AND (budgets.user_id = auth.uid() OR budgets.user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236')
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
      AND (budgets.user_id = auth.uid() OR budgets.user_id = 'c2a01f21-8733-4d78-8a39-d31ecfa73236')
    )
  );

SELECT 'Políticas RLS atualizadas com sucesso para seu usuário!' as status;
