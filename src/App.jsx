import { useEffect } from 'react'
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
import { LoadingOverlay } from './components/ui/loading'
import { useAppStore } from './lib/store'
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
  const { currentPage, isLoading, loadInitialData } = useAppStore()

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="flex-1">
        <LoadingOverlay isLoading={isLoading}>
          {renderCurrentPage()}
        </LoadingOverlay>
      </main>

      {/* Modais globais */}
      <TaskModal />
      <ItemModal />
      <BudgetModal />
      <CSUModal />
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
