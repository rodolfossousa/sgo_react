import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUIStore } from "@/lib/store"
import { csusAPI, itemsAPI, tasksAPI, calculateItemHours, calculateTaskHours } from "@/lib/api"

export default function CSUModal({ onSuccess }) {
  const { isCSUModalOpen, editingCSU, closeCSUModal } = useUIStore()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budgetId: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [availableItems, setAvailableItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([]) // { itemId, complexity }
  const [availableTasks, setAvailableTasks] = useState([])
  const [selectedTasks, setSelectedTasks] = useState([]) // { taskId, complexity }

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isCSUModalOpen) {
      if (editingCSU) {
        setFormData({
          name: editingCSU.name || "",
          description: editingCSU.description || "",
          budgetId: editingCSU.budget_id || editingCSU.budgetId
        })
      } else {
        setFormData({
          name: "",
          description: "",
          budgetId: null
        })
      }
      setErrors({})
    }
  }, [isCSUModalOpen, editingCSU])

  // Carregar itens disponíveis quando o modal abrir
  useEffect(() => {
    if (!isCSUModalOpen) return
    ;(async () => {
      try {
        const items = await itemsAPI.getAll()
        const tasks = await tasksAPI.getAll()
        setAvailableItems(items || [])
        setAvailableTasks(tasks || [])
        // Se estiver editando, mapear os items e tarefas já vinculados
        if (editingCSU) {
          if (editingCSU.csu_items) {
            const mapped = editingCSU.csu_items.map(ci => ({ itemId: ci.item_id, complexity: ci.complexity || 'low' }))
            setSelectedItems(mapped)
          } else {
            setSelectedItems([])
          }

          if (editingCSU.csu_tasks) {
            const mappedTasks = editingCSU.csu_tasks.map(ct => ({ taskId: ct.task_id, complexity: ct.complexity || 'low' }))
            setSelectedTasks(mappedTasks)
          } else {
            setSelectedTasks([])
          }
        } else {
          setSelectedItems([])
          setSelectedTasks([])
        }
      } catch (err) {
        console.error('Erro ao carregar itens para CSU:', err)
      }
    })()
  }, [isCSUModalOpen, editingCSU])
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    
    if (!editingCSU && !formData.budgetId) {
      newErrors.general = "ID do orçamento é obrigatório"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const csuData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        budgetId: formData.budgetId,
        items: selectedItems,
        tasks: selectedTasks
      }
      
      if (editingCSU && editingCSU.id) {
        await csusAPI.update(editingCSU.id, csuData)
      } else {
        await csusAPI.create(csuData)
      }
      
      closeCSUModal()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar CSU:", error)
      setErrors({ general: "Erro ao salvar CSU. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelectItem = (item) => {
    const exists = selectedItems.find(si => si.itemId === item.id)
    if (exists) {
      setSelectedItems(prev => prev.filter(si => si.itemId !== item.id))
    } else {
      setSelectedItems(prev => [...prev, { itemId: item.id, complexity: 'low' }])
    }
  }

  const setItemComplexity = (itemId, complexity) => {
    setSelectedItems(prev => prev.map(si => si.itemId === itemId ? { ...si, complexity } : si))
  }

  const previewItemHours = (itemId, complexity) => {
    const item = availableItems.find(i => i.id === itemId)
    try {
      return calculateItemHours(item, complexity)
    } catch (e) {
      return 0
    }
  }

  const toggleSelectTask = (task) => {
    const exists = selectedTasks.find(st => st.taskId === task.id)
    if (exists) {
      setSelectedTasks(prev => prev.filter(st => st.taskId !== task.id))
    } else {
      setSelectedTasks(prev => [...prev, { taskId: task.id, complexity: 'low' }])
    }
  }

  const setTaskComplexity = (taskId, complexity) => {
    setSelectedTasks(prev => prev.map(st => st.taskId === taskId ? { ...st, complexity } : st))
  }

  const previewTaskHours = (taskId, complexity) => {
    const task = availableTasks.find(t => t.id === taskId)
    try {
      return calculateTaskHours(task, complexity)
    } catch (e) {
      return 0
    }
  }

  const formatHours = (hours) => {
    if (!hours) return '0h'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }

  const csuPreviewTotal = () => {
    const itemsTotal = selectedItems.reduce((acc, si) => acc + previewItemHours(si.itemId, si.complexity), 0)
    const tasksTotal = selectedTasks.reduce((acc, st) => acc + previewTaskHours(st.taskId, st.complexity), 0)
    return itemsTotal + tasksTotal
  }
 
  return (
    <Dialog open={isCSUModalOpen} onOpenChange={closeCSUModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingCSU ? "Editar Caso de Uso" : "Novo Caso de Uso"}
          </DialogTitle>
          <DialogDescription>
            {editingCSU ? 
              "Altere as informações do caso de uso." : 
              "Crie um novo caso de uso para organizar itens e tarefas."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do CSU *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Autenticação de Usuários"
              className={errors.name ? "border-red-500" : ""}
              autoFocus
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
              placeholder="Descreva o caso de uso e suas funcionalidades..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 caracteres
            </p>
          </div>

          {/* Seção de seleção de itens com complexidade */}
          <div className="space-y-2">
            <Label>Vincular Itens</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto">
              {availableItems.map(item => {
                const selected = selectedItems.find(si => si.itemId === item.id)
                return (
                  <div key={item.id} className={`p-2 border rounded flex items-center justify-between ${selected ? 'bg-muted/10' : ''}`}>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected && (
                        <>
                          <select value={selected.complexity} onChange={(e) => setItemComplexity(item.id, e.target.value)} className="border px-2 py-1 rounded">
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="very_high">Altíssima</option>
                          </select>
                          <span className="text-xs text-muted-foreground ml-2">{formatHours(previewItemHours(item.id, selected.complexity))}</span>
                        </>
                      )}
                      <Button variant={selected ? 'destructive' : 'outline'} size="sm" onClick={() => toggleSelectItem(item)}>
                        {selected ? 'Remover' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Seção de seleção de tarefas individuais com complexidade */}
          <div className="space-y-2">
            <Label>Adicionar Tarefas Individuais</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto">
              {availableTasks.map(task => {
                const selected = selectedTasks.find(st => st.taskId === task.id)
                return (
                  <div key={task.id} className={`p-2 border rounded flex items-center justify-between ${selected ? 'bg-muted/10' : ''}`}>
                    <div>
                      <div className="font-medium">{task.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected && (
                        <>
                          <select value={selected.complexity} onChange={(e) => setTaskComplexity(task.id, e.target.value)} className="border px-2 py-1 rounded">
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="very_high">Altíssima</option>
                          </select>
                          <span className="text-xs text-muted-foreground ml-2">{formatHours(previewTaskHours(task.id, selected.complexity))}</span>
                        </>
                      )}
                      <Button variant={selected ? 'destructive' : 'outline'} size="sm" onClick={() => toggleSelectTask(task)}>
                        {selected ? 'Remover' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Pré-visualização do total do CSU */}
          <div className="p-3 bg-muted/5 border rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Total estimado do CSU</div>
              <div className="text-sm">{formatHours(csuPreviewTotal())}</div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCSUModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingCSU ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
