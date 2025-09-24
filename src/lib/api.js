import { supabase } from './supabase'

// ============ TASKS API ============

export const tasksAPI = {
  // Criar nova tarefa
  async create(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        description: taskData.description,
        complexity_low: taskData.complexityLow,
        complexity_medium: taskData.complexityMedium,
        complexity_high: taskData.complexityHigh,
        complexity_very_high: taskData.complexityVeryHigh,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar todas as tarefas do usuário
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Atualizar tarefa
  async update(taskId, taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        description: taskData.description,
        complexity_low: taskData.complexityLow,
        complexity_medium: taskData.complexityMedium,
        complexity_high: taskData.complexityHigh,
        complexity_very_high: taskData.complexityVeryHigh
      })
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Excluir tarefa
  async delete(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
  }
}

// ============ ITEMS API ============

export const itemsAPI = {
  // Criar novo item
  async create(itemData) {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert([{
        name: itemData.name,
        description: itemData.description,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single()
    
    if (itemError) throw itemError

    // Associar tarefas ao item
    if (itemData.taskIds && itemData.taskIds.length > 0) {
      const associations = itemData.taskIds.map(taskId => ({
        item_id: item.id,
        task_id: taskId
      }))

      const { error: assocError } = await supabase
        .from('item_tasks')
        .insert(associations)
      
      if (assocError) throw assocError
    }

    return item
  },

  // Buscar todos os itens do usuário
  async getAll() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        item_tasks (
          task_id,
          tasks (*)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Atualizar item
  async update(itemId, itemData) {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .update({
        name: itemData.name,
        description: itemData.description
      })
      .eq('id', itemId)
      .select()
      .single()
    
    if (itemError) throw itemError

    // Atualizar associações de tarefas
    // Primeiro, remover associações existentes
    await supabase
      .from('item_tasks')
      .delete()
      .eq('item_id', itemId)

    // Depois, adicionar novas associações
    if (itemData.taskIds && itemData.taskIds.length > 0) {
      const associations = itemData.taskIds.map(taskId => ({
        item_id: itemId,
        task_id: taskId
      }))

      const { error: assocError } = await supabase
        .from('item_tasks')
        .insert(associations)
      
      if (assocError) throw assocError
    }

    return item
  },

  // Excluir item
  async delete(itemId) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
    
    if (error) throw error
  }
}

// ============ BUDGETS API ============

export const budgetsAPI = {
  // Criar novo orçamento
  async create(budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        name: budgetData.name,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar todos os orçamentos do usuário
  async getAll() {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        csus (
          *,
          csu_items (
            *,
            items (*)
          ),
          csu_tasks (
            *,
            tasks (*)
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Atualizar orçamento
  async update(budgetId, budgetData) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        name: budgetData.name
      })
      .eq('id', budgetId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Excluir orçamento
  async delete(budgetId) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId)
    
    if (error) throw error
  }
}

// ============ CSUs API ============

export const csusAPI = {
  // Criar novo CSU
  async create(csuData) {
    const { data, error } = await supabase
      .from('csus')
      .insert([{
        budget_id: csuData.budgetId,
        name: csuData.name,
        description: csuData.description
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar CSU
  async update(csuId, csuData) {
    const { data, error } = await supabase
      .from('csus')
      .update({
        name: csuData.name,
        description: csuData.description
      })
      .eq('id', csuId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Excluir CSU
  async delete(csuId) {
    const { error } = await supabase
      .from('csus')
      .delete()
      .eq('id', csuId)
    
    if (error) throw error
  },

  // Adicionar item ao CSU
  async addItem(csuId, itemId, complexity) {
    const { data, error } = await supabase
      .from('csu_items')
      .insert([{
        csu_id: csuId,
        item_id: itemId,
        complexity: complexity,
        calculated_hours: 0 // Será calculado por uma função do banco
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Adicionar tarefa individual ao CSU
  async addTask(csuId, taskId, complexity) {
    const { data, error } = await supabase
      .from('csu_tasks')
      .insert([{
        csu_id: csuId,
        task_id: taskId,
        complexity: complexity,
        calculated_hours: 0 // Será calculado por uma função do banco
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Remover item do CSU
  async removeItem(csuItemId) {
    const { error } = await supabase
      .from('csu_items')
      .delete()
      .eq('id', csuItemId)
    
    if (error) throw error
  },

  // Remover tarefa do CSU
  async removeTask(csuTaskId) {
    const { error } = await supabase
      .from('csu_tasks')
      .delete()
      .eq('id', csuTaskId)
    
    if (error) throw error
  }
}

// ============ UTILITY FUNCTIONS ============

// Converter tempo HH:MM para decimal
export function timeToDecimal(timeString) {
  if (!timeString) return 0
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours + (minutes || 0) / 60
}

// Converter decimal para HH:MM
export function decimalToTime(decimal) {
  const hours = Math.floor(decimal)
  const minutes = Math.round((decimal - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Calcular horas de uma tarefa baseado na complexidade
export function calculateTaskHours(task, complexity) {
  if (!task) return 0
  
  const timeField = {
    low: 'complexity_low',
    medium: 'complexity_medium',
    high: 'complexity_high',
    very_high: 'complexity_very_high'
  }[complexity]
  
  return timeToDecimal(task[timeField])
}
