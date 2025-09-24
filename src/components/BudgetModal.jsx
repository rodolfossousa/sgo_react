import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUIStore } from "@/lib/store"
import { budgetsAPI } from "@/lib/api"

export default function BudgetModal({ onSuccess }) {
  const { isBudgetModalOpen, editingBudget, closeBudgetModal } = useUIStore()
  const [formData, setFormData] = useState({
    name: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isBudgetModalOpen) {
      if (editingBudget) {
        setFormData({
          name: editingBudget.name || ""
        })
      } else {
        setFormData({
          name: ""
        })
      }
      setErrors({})
    }
  }, [isBudgetModalOpen, editingBudget])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      const budgetData = {
        name: formData.name.trim()
      }
      
      if (editingBudget) {
        await budgetsAPI.update(editingBudget.id, budgetData)
      } else {
        await budgetsAPI.create(budgetData)
      }
      
      closeBudgetModal()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error)
      setErrors({ general: "Erro ao salvar orçamento. Tente novamente." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isBudgetModalOpen} onOpenChange={closeBudgetModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingBudget ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
          <DialogDescription>
            {editingBudget ? 
              "Altere o nome do orçamento." : 
              "Crie um novo orçamento para organizar seus projetos."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Orçamento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Sistema de E-commerce"
              className={errors.name ? "border-red-500" : ""}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Erro geral */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeBudgetModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (editingBudget ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
