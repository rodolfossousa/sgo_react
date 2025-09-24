import { create } from 'zustand'
import { supabase } from './supabase'

// Store principal da aplicação
export const useAppStore = create((set, get) => ({
  // Estado de autenticação
  user: null,
  isLoading: false,
  
  // Dados da aplicação
  tasks: [],
  items: [],
  budgets: [],
  
  // Estado da UI
  currentPage: 'home',
  searchTerm: '',
  selectedItems: [],
  
  // Actions de autenticação
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  
  // Actions de navegação
  setCurrentPage: (page) => set({ currentPage: page }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  // Actions de seleção
  toggleItemSelection: (itemId) => set((state) => ({
    selectedItems: state.selectedItems.includes(itemId)
      ? state.selectedItems.filter(id => id !== itemId)
      : [...state.selectedItems, itemId]
  })),
  clearSelection: () => set({ selectedItems: [] }),
  
  // Actions de dados
  setTasks: (tasks) => set({ tasks }),
  setItems: (items) => set({ items }),
  setBudgets: (budgets) => set({ budgets }),
  
  // Função para carregar dados iniciais
  loadInitialData: async () => {
    set({ isLoading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        set({ user })
        // Carregar dados do usuário
        await Promise.all([
          get().loadTasks(),
          get().loadItems(),
          get().loadBudgets()
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Carregar tarefas
  loadTasks: async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ tasks: data || [] })
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    }
  },
  
  // Carregar itens
  loadItems: async () => {
    try {
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
      set({ items: data || [] })
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    }
  },
  
  // Carregar orçamentos
  loadBudgets: async () => {
    try {
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
      set({ budgets: data || [] })
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
    }
  }
}))

// Store para modais e UI
export const useUIStore = create((set) => ({
  // Estado dos modais
  isTaskModalOpen: false,
  isItemModalOpen: false,
  isBudgetModalOpen: false,
  isCSUModalOpen: false,
  
  // Dados dos modais
  editingTask: null,
  editingItem: null,
  editingBudget: null,
  editingCSU: null,
  
  // Actions dos modais
  openTaskModal: (task = null) => set({ isTaskModalOpen: true, editingTask: task }),
  closeTaskModal: () => set({ isTaskModalOpen: false, editingTask: null }),
  
  openItemModal: (item = null) => set({ isItemModalOpen: true, editingItem: item }),
  closeItemModal: () => set({ isItemModalOpen: false, editingItem: null }),
  
  openBudgetModal: (budget = null) => set({ isBudgetModalOpen: true, editingBudget: budget }),
  closeBudgetModal: () => set({ isBudgetModalOpen: false, editingBudget: null }),
  
  openCSUModal: (csu = null) => set({ isCSUModalOpen: true, editingCSU: csu }),
  closeCSUModal: () => set({ isCSUModalOpen: false, editingCSU: null }),
})

)
