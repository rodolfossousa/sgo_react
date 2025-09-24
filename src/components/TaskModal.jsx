import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ComplexityBadge } from "@/components/ui/complexity-badge"
import { ModernCard } from "@/components/ui/modern-card"
import { useUIStore } from "@/lib/store"
import { tasksAPI } from "@/lib/api"
import { COMPLEXITY_TYPES, COMPLEXITY_LABELS } from "@/lib/supabase"

export default function TaskModal({ onSuccess }) {
  const { isTaskModalOpen, editingTask, closeTaskModal } = useUIStore()
  const [formData, setFormData] = useState({
    description: "",
    complexityLow: "",
    complexityMedium: "",
    complexityHigh: "",
    complexityVeryHigh: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isTaskModalOpen) {
      if (editingTask) {
        setFormData({
          description: editingTask.description || "",
          complexityLow: editingTask.complexity_low || "",
          complexityMedium: editingTask.complexity_medium || "",
          complexityHigh: editingTask.complexity_high || "",
          complexityVeryHigh: editingTask.complexity_very_high || ""
        })
      } else {
        setFormData({
          description: "",
          complexityLow: "",
          complexityMedium: "",
          complexityHigh: "",
          complexityVeryHigh: ""
        })
      }
      setErrors({})
    }
  }, [isTaskModalOpen, editingTask])

  const validateTimeFormat = (time) => {
    if (!time) return true
    const timeRegex = /^\d{1,3}(:[0-5]\d)?$/
    return timeRegex.test(time)
  }

  const formatTimeInput = (value) => {
    // Remove caracteres não numéricos exceto ':'
    let cleaned = value.replace(/[^\d:]/g, '')
    
    // Se não tem ':', adiciona automaticamente após 2 dígitos
    if (!cleaned.includes(':') && cleaned.length > 2) {
      cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2, 4)
    }
    
    return cleaned
  }

  const handleTimeChange = (field, value) => {
    const formatted = formatTimeInput(value)
    setFormData(prev => ({ ...prev, [field]: formatted }))
    
    // Limpar erro se o formato estiver correto
    if (validateTimeFormat(formatted)) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    }
    
    // Validar formatos de tempo
    const timeFields = [
      { field: 'complexityLow', label: 'Complexidade Baixa' },
      { field: 'complexityMedium', label: 'Complexidade Média' },
      { field: 'complexityHigh', label: 'Complexidade Alta' },
      { field: 'complexityVeryHigh', label: 'Complexidade Altíssima' }
    ]
    
    timeFields.forEach(({ field, label }) => {
      const value = formData[field]
      if (value && !validateTimeFormat(value)) {
        newErrors[field] = `Formato inválido para ${label}. Use HH:MM ou HH`
      }
    })
    
    // Pelo menos uma complexidade deve ser preenchida
    const hasAnyTime = timeFields.some(({ field }) => formData[field])
    if (!hasAnyTime) {
      newErrors.general = "Pelo menos uma complexidade deve ser preenchida"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const taskData = {
        description: formData.description.trim(),
        complexityLow: formData.complexityLow || null,
        complexityMedium: formData.complexityMedium || null,
        complexityHigh: formData.complexityHigh || null,
        complexityVeryHigh: formData.complexityVeryHigh || null
      }
      
      if (editingTask) {
        await tasksAPI.update(editingTask.id, taskData)
      } else {
        await tasksAPI.create(taskData)
      }
      
      closeTaskModal()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error)
      setErrors({ general: "Erro ao salvar tarefa. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  const complexityFields = [
    { 
      key: 'complexityLow', 
      type: COMPLEXITY_TYPES.LOW,
      label: COMPLEXITY_LABELS[COMPLEXITY_TYPES.LOW],
      placeholder: "Ex: 2:30"
    },
    { 
      key: 'complexityMedium', 
      type: COMPLEXITY_TYPES.MEDIUM,
      label: COMPLEXITY_LABELS[COMPLEXITY_TYPES.MEDIUM],
      placeholder: "Ex: 8:00"
    },
    { 
      key: 'complexityHigh', 
      type: COMPLEXITY_TYPES.HIGH,
      label: COMPLEXITY_LABELS[COMPLEXITY_TYPES.HIGH],
      placeholder: "Ex: 20:00"
    },
    { 
      key: 'complexityVeryHigh', 
      type: COMPLEXITY_TYPES.VERY_HIGH,
      label: COMPLEXITY_LABELS[COMPLEXITY_TYPES.VERY_HIGH],
      placeholder: "Ex: 40:00"
    }
  ]

  return (
    <Dialog open={isTaskModalOpen} onOpenChange={closeTaskModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            Configure uma tarefa com estimativas de tempo para diferentes níveis de complexidade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Tarefa *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Implementar autenticação de usuário"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Complexidades */}
          <div className="space-y-4">
            <Label>Estimativas por Complexidade</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {complexityFields.map(({ key, type, label, placeholder }) => (
                <ModernCard key={key} className="p-4" hover={false}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={key}>{label}</Label>
                      <ComplexityBadge complexity={type} />
                    </div>
                    <Input
                      id={key}
                      value={formData[key]}
                      onChange={(e) => handleTimeChange(key, e.target.value)}
                      placeholder={placeholder}
                      className={errors[key] ? "border-red-500" : ""}
                    />
                    {errors[key] && (
                      <p className="text-xs text-red-500">{errors[key]}</p>
                    )}
                  </div>
                </ModernCard>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Formato: HH:MM ou apenas HH (ex: 2:30 ou 8)
            </p>
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeTaskModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingTask ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
