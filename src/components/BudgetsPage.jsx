import { useState, useEffect } from "react"
import { Plus, Calculator, Edit, Trash2, FolderOpen, Clock, Package, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComplexityBadge } from "@/components/ui/complexity-badge"
import { ExpandableCard, StatsCard } from "@/components/ui/modern-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingOverlay } from "@/components/ui/loading"
import { SearchBar } from "@/components/ui/search"
import { useAppStore, useUIStore } from "@/lib/store"
import { budgetsAPI } from "@/lib/api"
import BudgetModal from "./BudgetModal"
import CSUModal from "./CSUModal"

export default function BudgetsPage() {
  const { budgets, isLoading, setBudgets, selectedItems, toggleItemSelection, clearSelection } = useAppStore()
  const { openBudgetModal, openCSUModal } = useUIStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredBudgets, setFilteredBudgets] = useState([])
  const [expandedBudgets, setExpandedBudgets] = useState(new Set())

  // Carregar orçamentos ao montar o componente
  useEffect(() => {
    loadBudgets()
  }, [])

  // Filtrar orçamentos baseado na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBudgets(budgets)
    } else {
      const filtered = budgets.filter(budget =>
        budget.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBudgets(filtered)
    }
  }, [budgets, searchTerm])

  const loadBudgets = async () => {
    try {
      const data = await budgetsAPI.getAll()
      setBudgets(data)
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    try {
      await Promise.all(
        selectedItems.map(budgetId => budgetsAPI.delete(budgetId))
      )
      await loadBudgets()
      clearSelection()
    } catch (error) {
      console.error("Erro ao excluir orçamentos:", error)
    }
  }

  const handleEditBudget = (budget) => {
    openBudgetModal(budget)
  }

  const handleAddCSU = (budgetId) => {
    openCSUModal({ budgetId })
  }

  const toggleBudgetExpansion = (budgetId) => {
    setExpandedBudgets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(budgetId)) {
        newSet.delete(budgetId)
      } else {
        newSet.add(budgetId)
      }
      return newSet
    })
  }

  const formatHours = (hours) => {
    if (!hours) return "0h"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }

  const getBudgetStats = () => {
    const totalBudgets = budgets.length
    const totalHours = budgets.reduce((sum, budget) => sum + (budget.total_hours || 0), 0)
    const totalCSUs = budgets.reduce((sum, budget) => sum + (budget.csus?.length || 0), 0)
    const activeBudgets = budgets.filter(budget => budget.csus?.length > 0).length

    return { totalBudgets, totalHours, totalCSUs, activeBudgets }
  }

  const stats = getBudgetStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Orçamentos</h1>
          <p className="text-muted-foreground">
            Organize projetos em orçamentos com casos de uso estruturados
          </p>
        </div>
        <Button onClick={() => openBudgetModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Estatísticas */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Orçamentos"
            value={stats.totalBudgets}
            icon={Calculator}
          />
          <StatsCard
            title="Orçamentos Ativos"
            value={stats.activeBudgets}
            description="Com CSUs cadastrados"
            icon={FolderOpen}
          />
          <StatsCard
            title="Total de CSUs"
            value={stats.totalCSUs}
            icon={Users}
          />
          <StatsCard
            title="Horas Estimadas"
            value={formatHours(stats.totalHours)}
            icon={Clock}
          />
        </div>
      )}

      {/* Barra de busca e ações */}
      <SearchBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {selectedItems.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Excluir ({selectedItems.length})
          </Button>
        )}
      </SearchBar>

      {/* Lista de orçamentos */}
      <LoadingOverlay isLoading={isLoading}>
        {filteredBudgets.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="Nenhum orçamento encontrado"
            description={searchTerm ? 
              "Nenhum orçamento corresponde à sua busca." : 
              "Comece criando seu primeiro orçamento de projeto."
            }
            action={() => openBudgetModal()}
            actionLabel="Criar Primeiro Orçamento"
          />
        ) : (
          <div className="space-y-4">
            {filteredBudgets.map((budget) => {
              const isExpanded = expandedBudgets.has(budget.id)
              const isSelected = selectedItems.includes(budget.id)
              const csus = budget.csus || []
              
              return (
                <ExpandableCard
                  key={budget.id}
                  title={budget.name}
                  description={`${csus.length} CSU(s) • ${formatHours(budget.total_hours || 0)} estimadas`}
                  expanded={isExpanded}
                  onToggle={() => toggleBudgetExpansion(budget.id)}
                  badges={[
                    <Badge key="status" variant={csus.length > 0 ? "default" : "secondary"}>
                      {csus.length > 0 ? "Ativo" : "Vazio"}
                    </Badge>
                  ]}
                  actions={
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddCSU(budget.id)
                        }}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        CSU
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBudget(budget)
                        }}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                    </div>
                  }
                  className={isSelected ? "ring-2 ring-primary" : ""}
                >
                  {/* Conteúdo expandido - CSUs */}
                  <div className="space-y-4">
                    {csus.length === 0 ? (
                      <EmptyState
                        icon={Package}
                        title="Nenhum CSU cadastrado"
                        description="Adicione casos de uso para estruturar este orçamento."
                        action={() => handleAddCSU(budget.id)}
                        actionLabel="Adicionar Primeiro CSU"
                      />
                    ) : (
                      <div className="space-y-3">
                        {csus.map((csu) => (
                          <div
                            key={csu.id}
                            className="border rounded-lg p-4 bg-muted/20 space-y-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium">{csu.name}</h4>
                                {csu.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {csu.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {formatHours(csu.total_hours || 0)}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCSUModal(csu)}
                                  className="gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </Button>
                              </div>
                            </div>

                            {/* Itens e tarefas do CSU */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Itens */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Itens ({csu.csu_items?.length || 0})
                                </h5>
                                {csu.csu_items?.map((csuItem) => (
                                  <div key={csuItem.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate">{csuItem.items?.name}</span>
                                    <div className="flex items-center gap-2">
                                      <ComplexityBadge complexity={csuItem.complexity} />
                                      <span className="text-xs text-muted-foreground">
                                        {formatHours(csuItem.calculated_hours || 0)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Tarefas individuais */}
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Tarefas ({csu.csu_tasks?.length || 0})
                                </h5>
                                {csu.csu_tasks?.map((csuTask) => (
                                  <div key={csuTask.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate">{csuTask.tasks?.description}</span>
                                    <div className="flex items-center gap-2">
                                      <ComplexityBadge complexity={csuTask.complexity} />
                                      <span className="text-xs text-muted-foreground">
                                        {formatHours(csuTask.calculated_hours || 0)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ExpandableCard>
              )
            })}
          </div>
        )}
      </LoadingOverlay>

      {/* Modais */}
      <BudgetModal onSuccess={loadBudgets} />
      <CSUModal onSuccess={loadBudgets} />
    </div>
  )
}
