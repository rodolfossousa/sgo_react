import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navigation from './components/Navigation'
import HomePage from './components/HomePage'
import TasksPage from './components/TasksPage'
import ItemsPage from './components/ItemsPage'
import BudgetsPage from './components/BudgetsPage'
import TaskModal from './components/TaskModal'
import ItemModal from './components/ItemModal'
import BudgetModal from './components/BudgetModal'
import CSUModal from './components/CSUModal'
import LoginModal from './components/LoginModal'
import { LoadingOverlay } from './components/ui/loading'
import { useAppStore } from './lib/store'
import { supabase } from './lib/supabase'
import './App.css'

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})

function AppContent() {
  const { currentPage, isLoading, loadInitialData, user, setUser } = useAppStore()
  const [showLogin, setShowLogin] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setShowLogin(false)
      } else {
        setShowLogin(true)
      }
      setIsInitialized(true)
    }
    checkAuth()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        setShowLogin(false)
      } else {
        setUser(null)
        setShowLogin(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carregar dados iniciais quando usuário estiver logado
  useEffect(() => {
    if (user && isInitialized) {
      loadInitialData()
    }
  }, [user, isInitialized]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tasks':
        return <TasksPage />
      case 'items':
        return <ItemsPage />
      case 'budgets':
        return <BudgetsPage />
      default:
        return <HomePage />
    }
  }

  // Mostrar loading enquanto inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Inicializando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal 
          isOpen={showLogin} 
          onClose={() => setShowLogin(false)} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1">
        <LoadingOverlay isLoading={isLoading}>
          {renderCurrentPage()}
        </LoadingOverlay>
      </main>

      {/* Modais globais */}
      <TaskModal onSuccess={() => {
        // Recarregar apenas os dados necessários
        const { loadTasks, loadItems } = useAppStore.getState()
        Promise.all([loadTasks(), loadItems()])
      }} />
      <ItemModal onSuccess={() => {
        const { loadItems } = useAppStore.getState()
        loadItems()
      }} />
      <BudgetModal onSuccess={() => {
        const { loadBudgets } = useAppStore.getState()
        loadBudgets()
      }} />
      <CSUModal onSuccess={() => {
        const { loadBudgets } = useAppStore.getState()
        loadBudgets()
      }} />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App
