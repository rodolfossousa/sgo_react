import { useState, useEffect } from "react"
import { Plus, Package, Edit, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComplexityBadge } from "@/components/ui/complexity-badge"
import { ModernCard, ListCard } from "@/components/ui/modern-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingOverlay } from "@/components/ui/loading"
import { SearchBar } from "@/components/ui/search"
import { useAppStore, useUIStore } from "@/lib/store"
import { itemsAPI } from "@/lib/api"
import ItemModal from "./ItemModal"

export default function ItemsPage() {
  const { items, isLoading, setItems, selectedItems, toggleItemSelection, clearSelection } = useAppStore()
  const { openItemModal } = useUIStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredItems, setFilteredItems] = useState([])

  // Carregar itens ao montar o componente
  useEffect(() => {
    loadItems()
  }, [])

  // Filtrar itens baseado na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredItems(filtered)
    }
  }, [items, searchTerm])

  const loadItems = async () => {
    try {
      const data = await itemsAPI.getAll()
      setItems(data)
    } catch (error) {
      console.error("Erro ao carregar itens:", error)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    try {
      await Promise.all(
        selectedItems.map(itemId => itemsAPI.delete(itemId))
      )
      await loadItems()
      clearSelection()
    } catch (error) {
      console.error("Erro ao excluir itens:", error)
    }
  }

  const handleEditItem = (item) => {
    openItemModal(item)
  }

  const getItemTasks = (item) => {
    if (!item.item_tasks) return []
    return item.item_tasks.map(it => it.tasks).filter(Boolean)
  }

  const getTaskComplexities = (tasks) => {
    const complexities = new Set()
    tasks.forEach(task => {
      if (task.complexity_low) complexities.add('low')
      if (task.complexity_medium) complexities.add('medium')
      if (task.complexity_high) complexities.add('high')
      if (task.complexity_very_high) complexities.add('very_high')
    })
    return Array.from(complexities)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Itens</h1>
          <p className="text-muted-foreground">
            Gerencie itens reutilizáveis compostos por tarefas
          </p>
        </div>
        <Button onClick={() => openItemModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Item
        </Button>
      </div>

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

      {/* Lista de itens */}
      <LoadingOverlay isLoading={isLoading}>
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum item encontrado"
            description={searchTerm ? 
              "Nenhum item corresponde à sua busca." : 
              "Comece criando seu primeiro item composto por tarefas."
            }
            action={() => openItemModal()}
            actionLabel="Criar Primeiro Item"
          />
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => {
              const tasks = getItemTasks(item)
              const complexities = getTaskComplexities(tasks)
              const isSelected = selectedItems.includes(item.id)
              
              return (
                <ListCard
                  key={item.id}
                  title={item.name}
                  description={item.description}
                  selected={isSelected}
                  onClick={() => toggleItemSelection(item.id)}
                  badges={[
                    <Badge key="tasks" variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </Badge>,
                    ...complexities.map((complexity, index) => (
                      <ComplexityBadge key={index} complexity={complexity} />
                    ))
                  ]}
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditItem(item)
                      }}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  }
                >
                  {/* Lista de tarefas associadas */}
                  {tasks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Tarefas Associadas
                      </h4>
                      <div className="space-y-1">
                        {tasks.slice(0, 3).map((task, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate">
                              {task.description}
                            </span>
                            <div className="flex gap-1 ml-2">
                              {task.complexity_low && <span className="text-green-600">B</span>}
                              {task.complexity_medium && <span className="text-yellow-600">M</span>}
                              {task.complexity_high && <span className="text-orange-600">A</span>}
                              {task.complexity_very_high && <span className="text-red-600">AA</span>}
                            </div>
                          </div>
                        ))}
                        {tasks.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{tasks.length - 3} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </ListCard>
              )
            })}
          </div>
        )}
      </LoadingOverlay>

      {/* Modal de item */}
      <ItemModal onSuccess={loadItems} />
    </div>
  )
}
