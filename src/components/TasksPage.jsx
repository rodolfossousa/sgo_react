import { useState, useEffect } from "react"
import { Plus, Clock, Edit, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ComplexityBadge } from "@/components/ui/complexity-badge"
import { ModernCard, ListCard } from "@/components/ui/modern-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingOverlay, ListSkeleton } from "@/components/ui/loading"
import { SearchBar } from "@/components/ui/search"
import { useAppStore, useUIStore } from "@/lib/store"
import { tasksAPI } from "@/lib/api"
import { COMPLEXITY_TYPES, COMPLEXITY_LABELS } from "@/lib/supabase"
import TaskModal from "./TaskModal"

export default function TasksPage() {
  const { tasks, isLoading, setTasks, selectedItems, toggleItemSelection, clearSelection } = useAppStore()
  const { openTaskModal } = useUIStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTasks, setFilteredTasks] = useState([])

  // Carregar tarefas ao montar o componente
  useEffect(() => {
    loadTasks()
  }, [])

  // Filtrar tarefas baseado na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter(task =>
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTasks(filtered)
    }
  }, [tasks, searchTerm])

  const loadTasks = async () => {
    try {
      const data = await tasksAPI.getAll()
      setTasks(data)
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return
    
    try {
      await Promise.all(
        selectedItems.map(taskId => tasksAPI.delete(taskId))
      )
      await loadTasks()
      clearSelection()
    } catch (error) {
      console.error("Erro ao excluir tarefas:", error)
    }
  }

  const handleEditTask = (task) => {
    openTaskModal(task)
  }

  const formatTime = (timeString) => {
    if (!timeString) return "0h"
    const [hours, minutes] = timeString.split(':')
    return minutes && minutes !== '00' ? `${hours}h${minutes}m` : `${hours}h`
  }

  const getComplexityInfo = (task) => {
    const complexities = [
      { type: COMPLEXITY_TYPES.LOW, time: task.complexity_low },
      { type: COMPLEXITY_TYPES.MEDIUM, time: task.complexity_medium },
      { type: COMPLEXITY_TYPES.HIGH, time: task.complexity_high },
      { type: COMPLEXITY_TYPES.VERY_HIGH, time: task.complexity_very_high }
    ]
    
    return complexities.filter(c => c.time)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Banco de Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie tarefas com estimativas de tempo por complexidade
          </p>
        </div>
        <Button onClick={() => openTaskModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
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

      {/* Lista de tarefas */}
      <LoadingOverlay isLoading={isLoading}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nenhuma tarefa encontrada"
            description={searchTerm ? 
              "Nenhuma tarefa corresponde à sua busca." : 
              "Comece criando sua primeira tarefa com estimativas de tempo."
            }
            action={() => openTaskModal()}
            actionLabel="Criar Primeira Tarefa"
          />
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const complexities = getComplexityInfo(task)
              const isSelected = selectedItems.includes(task.id)
              
              return (
                <ListCard
                  key={task.id}
                  title={task.description}
                  selected={isSelected}
                  onClick={() => toggleItemSelection(task.id)}
                  badges={complexities.map((complexity, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <ComplexityBadge complexity={complexity.type} />
                      <span className="text-xs text-muted-foreground">
                        {formatTime(complexity.time)}
                      </span>
                    </div>
                  ))}
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditTask(task)
                      }}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  }
                >
                  {/* Detalhes das complexidades */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {Object.values(COMPLEXITY_TYPES).map((type) => {
                      const timeField = `complexity_${type}`
                      const time = task[timeField]
                      
                      return (
                        <div key={type} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {COMPLEXITY_LABELS[type]}:
                          </span>
                          <span className="font-medium">
                            {time ? formatTime(time) : "-"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </ListCard>
              )
            })}
          </div>
        )}
      </LoadingOverlay>

      {/* Modal de tarefa */}
      <TaskModal onSuccess={loadTasks} />
    </div>
  )
}
