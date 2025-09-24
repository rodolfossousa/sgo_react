import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUIStore } from "@/lib/store"
import { csusAPI } from "@/lib/api"

export default function CSUModal({ onSuccess }) {
  const { isCSUModalOpen, editingCSU, closeCSUModal } = useUIStore()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budgetId: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
        budgetId: formData.budgetId
      }
      
      if (editingCSU) {
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

          {/* Erro geral */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

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
