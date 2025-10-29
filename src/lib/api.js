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
    // Criar CSU
    const { data: csu, error } = await supabase
      .from('csus')
      .insert([{
        budget_id: csuData.budgetId,
        name: csuData.name,
        description: csuData.description
      }])
      .select()
      .single()

    if (error) throw error

    // Se vierem items para vincular, inserir em csu_items
    if (csuData.items && csuData.items.length > 0) {
      // Buscar detalhes dos items (com suas tarefas) para cálculo
      const itemIds = csuData.items.map(i => i.itemId)
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select(`*, item_tasks ( task_id, tasks (*) )`)
        .in('id', itemIds)

      if (itemsError) throw itemsError

      // Preparar inserts com cálculo de horas
      const inserts = csuData.items.map(link => {
        const item = items.find(it => it.id === link.itemId)
        // calcular horas somando as tasks vinculadas ao item conforme a complexidade escolhida
        let calculated_hours = 0
        if (item && item.item_tasks && item.item_tasks.length > 0) {
          for (const itTask of item.item_tasks) {
            const task = itTask.tasks
            if (task) {
              calculated_hours += calculateTaskHours(task, link.complexity)
            }
          }
        }

        return {
          csu_id: csu.id,
          item_id: link.itemId,
          complexity: link.complexity,
          calculated_hours: calculated_hours
        }
      })

      const { error: insertError } = await supabase
        .from('csu_items')
        .insert(inserts)

      if (insertError) throw insertError
    }

    return csu
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
    // Se vierem items, substituir as associações (remover existentes e inserir novas)
    if (csuData.items) {
      // Remover existentes
      const { error: delErr } = await supabase
        .from('csu_items')
        .delete()
        .eq('csu_id', csuId)

      if (delErr) throw delErr

      if (csuData.items.length > 0) {
        const itemIds = csuData.items.map(i => i.itemId)
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select(`*, item_tasks ( task_id, tasks (*) )`)
          .in('id', itemIds)

        if (itemsError) throw itemsError

        const inserts = csuData.items.map(link => {
          const item = items.find(it => it.id === link.itemId)
          let calculated_hours = 0
          if (item && item.item_tasks && item.item_tasks.length > 0) {
            for (const itTask of item.item_tasks) {
              const task = itTask.tasks
              if (task) calculated_hours += calculateTaskHours(task, link.complexity)
            }
          }
          return {
            csu_id: csuId,
            item_id: link.itemId,
            complexity: link.complexity,
            calculated_hours: calculated_hours
          }
        })

        const { error: insertError } = await supabase
          .from('csu_items')
          .insert(inserts)

        if (insertError) throw insertError
      }
    }

    // Se vierem tarefas individuais, substituir csu_tasks
    if (csuData.tasks) {
      const { error: delTasksErr } = await supabase
        .from('csu_tasks')
        .delete()
        .eq('csu_id', csuId)

      if (delTasksErr) throw delTasksErr

      if (csuData.tasks.length > 0) {
        const taskIds = csuData.tasks.map(t => t.taskId)
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .in('id', taskIds)

        if (tasksError) throw tasksError

        const inserts = csuData.tasks.map(link => {
          const task = tasks.find(t => t.id === link.taskId)
          const calculated_hours = task ? calculateTaskHours(task, link.complexity) : 0
          return {
            csu_id: csuId,
            task_id: link.taskId,
            complexity: link.complexity,
            calculated_hours: calculated_hours
          }
        })

        const { error: insertTasksError } = await supabase
          .from('csu_tasks')
          .insert(inserts)

        if (insertTasksError) throw insertTasksError
      }
    }

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
    // Buscar item com suas tasks para calcular horas
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`*, item_tasks ( task_id, tasks (*) )`)
      .eq('id', itemId)

    if (itemsError) throw itemsError

    const item = (items && items[0]) || null
    let calculated_hours = 0
    if (item) {
      // calcular usando as tasks vinculadas
      if (item.item_tasks && item.item_tasks.length > 0) {
        for (const itTask of item.item_tasks) {
          const task = itTask.tasks
          if (task) calculated_hours += calculateTaskHours(task, complexity)
        }
      }
    }

    const { data, error } = await supabase
      .from('csu_items')
      .insert([{
        csu_id: csuId,
        item_id: itemId,
        complexity: complexity,
        calculated_hours: calculated_hours
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Adicionar tarefa individual ao CSU
  async addTask(csuId, taskId, complexity) {
    // Buscar task para calcular horas
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)

    if (tasksError) throw tasksError

    const task = (tasks && tasks[0]) || null
    const calculated_hours = task ? calculateTaskHours(task, complexity) : 0

    const { data, error } = await supabase
      .from('csu_tasks')
      .insert([{
        csu_id: csuId,
        task_id: taskId,
        complexity: complexity,
        calculated_hours: calculated_hours
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

// Calcular horas totais de um item (soma de suas tasks de acordo com complexity)
export function calculateItemHours(item, complexity) {
  if (!item) return 0
  if (!item.item_tasks || item.item_tasks.length === 0) return 0

  let total = 0
  for (const itTask of item.item_tasks) {
    const task = itTask.tasks
    if (task) total += calculateTaskHours(task, complexity)
  }
  return total
}

// Calcular horas de um CSU (soma dos csu_items.calculated_hours ou computa dinamicamente)
export function calculateCSUHours(csu) {
  if (!csu) return 0
  // Preferir campo calculado no csu_items quando disponível
  let total = 0

  if (csu.csu_items && csu.csu_items.length > 0) {
    total += csu.csu_items.reduce((acc, ci) => acc + (ci.calculated_hours || 0), 0)
  }

  if (csu.csu_tasks && csu.csu_tasks.length > 0) {
    total += csu.csu_tasks.reduce((acc, ct) => acc + (ct.calculated_hours || 0), 0)
  }

  // If neither had precomputed values, try to compute from nested objects
  if (total === 0) {
    if (csu.csu_items && csu.csu_items.length > 0) {
      for (const ci of csu.csu_items) {
        const item = ci.items || ci.item || ci.items
        total += calculateItemHours(item, ci.complexity)
      }
    }

    if (csu.csu_tasks && csu.csu_tasks.length > 0) {
      for (const ct of csu.csu_tasks) {
        const task = ct.tasks || ct.task
        total += calculateTaskHours(task, ct.complexity)
      }
    }
  }

  return total
}
