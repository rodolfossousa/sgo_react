import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComplexityBadge } from "@/components/ui/complexity-badge"
import { ModernCard } from "@/components/ui/modern-card"
import { SearchInput } from "@/components/ui/search"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingOverlay } from "@/components/ui/loading"
import { useUIStore, useAppStore } from "@/lib/store"
import { itemsAPI, tasksAPI } from "@/lib/api"
import { Package, Search } from "lucide-react"

export default function ItemModal({ onSuccess }) {
  const { isItemModalOpen, editingItem, closeItemModal } = useUIStore()
  const { tasks } = useAppStore()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    taskIds: []
  })
  const [availableTasks, setAvailableTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [taskSearchTerm, setTaskSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [errors, setErrors] = useState({})

  // Carregar tarefas disponíveis
  useEffect(() => {
    if (isItemModalOpen) {
      loadAvailableTasks()
    }
  }, [isItemModalOpen])

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isItemModalOpen) {
      if (editingItem) {
        const taskIds = editingItem.item_tasks?.map(it => it.task_id) || []
        setFormData({
          name: editingItem.name || "",
          description: editingItem.description || "",
          taskIds: taskIds
        })
      } else {
        setFormData({
          name: "",
          description: "",
          taskIds: []
        })
      }
      setErrors({})
      setTaskSearchTerm("")
    }
  }, [isItemModalOpen, editingItem])

  // Filtrar tarefas baseado na busca
  useEffect(() => {
    if (!taskSearchTerm) {
      setFilteredTasks(availableTasks)
    } else {
      const filtered = availableTasks.filter(task =>
        task.description.toLowerCase().includes(taskSearchTerm.toLowerCase())
      )
      setFilteredTasks(filtered)
    }
  }, [availableTasks, taskSearchTerm])

  const loadAvailableTasks = async () => {
    setIsLoadingTasks(true)
    try {
      const data = await tasksAPI.getAll()
      setAvailableTasks(data)
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  const handleTaskToggle = (taskId) => {
    setFormData(prev => ({
      ...prev,
      taskIds: prev.taskIds.includes(taskId)
        ? prev.taskIds.filter(id => id !== taskId)
        : [...prev.taskIds, taskId]
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    
    if (formData.taskIds.length === 0) {
      newErrors.tasks = "Selecione pelo menos uma tarefa"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        taskIds: formData.taskIds
      }
      
      if (editingItem) {
        await itemsAPI.update(editingItem.id, itemData)
      } else {
        await itemsAPI.create(itemData)
      }
      
      closeItemModal()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar item:", error)
      setErrors({ general: "Erro ao salvar item. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const getTaskComplexities = (task) => {
    const complexities = []
    if (task.complexity_low) complexities.push('low')
    if (task.complexity_medium) complexities.push('medium')
    if (task.complexity_high) complexities.push('high')
    if (task.complexity_very_high) complexities.push('very_high')
    return complexities
  }

  const selectedTasks = availableTasks.filter(task => formData.taskIds.includes(task.id))

  return (
    <Dialog open={isItemModalOpen} onOpenChange={closeItemModal}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Item" : "Novo Item"}
          </DialogTitle>
          <DialogDescription>
            Configure um item composto por tarefas reutilizáveis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col space-y-6">
          {/* Informações básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Item *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Sistema de Autenticação"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que este item representa..."
                rows={3}
              />
            </div>
          </div>

          {/* Seleção de tarefas */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tarefas Associadas *</Label>
              <span className="text-sm text-muted-foreground">
                {formData.taskIds.length} selecionada(s)
              </span>
            </div>

            {/* Tarefas selecionadas */}
            {selectedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selecionadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span className="truncate max-w-[200px]">{task.description}</span>
                      <button
                        type="button"
                        onClick={() => handleTaskToggle(task.id)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Busca de tarefas */}
            <SearchInput
              placeholder="Buscar tarefas..."
              value={taskSearchTerm}
              onChange={setTaskSearchTerm}
            />

            {/* Lista de tarefas disponíveis */}
            <div className="flex-1 overflow-hidden">
              <LoadingOverlay isLoading={isLoadingTasks}>
                <div className="h-full overflow-y-auto space-y-2 pr-2">
                  {filteredTasks.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="Nenhuma tarefa encontrada"
                      description={taskSearchTerm ? 
                        "Nenhuma tarefa corresponde à sua busca." : 
                        "Nenhuma tarefa disponível."
                      }
                    />
                  ) : (
                    filteredTasks.map(task => {
                      const isSelected = formData.taskIds.includes(task.id)
                      const complexities = getTaskComplexities(task)
                      
                      return (
                        <ModernCard
                          key={task.id}
                          className={`p-3 cursor-pointer transition-colors ${
                            isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                          }`}
                          onClick={() => handleTaskToggle(task.id)}
                          hover={!isSelected}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleTaskToggle(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <h4 className="font-medium text-sm">{task.description}</h4>
                              <div className="flex flex-wrap gap-1">
                                {complexities.map((complexity, index) => (
                                  <ComplexityBadge key={index} complexity={complexity} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      )
                    })
                  )}
                </div>
              </LoadingOverlay>
            </div>

            {errors.tasks && (
              <p className="text-sm text-red-500">{errors.tasks}</p>
            )}
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeItemModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingItem ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
