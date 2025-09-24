import { useState, useEffect } from "react"
import { Calculator, Package, Clock, Plus, TrendingUp, Users, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard, ModernCard } from "@/components/ui/modern-card"
import { Badge } from "@/components/ui/badge"
import { useAppStore, useUIStore } from "@/lib/store"

export default function HomePage() {
  const { budgets, items, tasks, currentPage, setCurrentPage } = useAppStore()
  const { openBudgetModal, openItemModal, openTaskModal } = useUIStore()

  const getStats = () => {
    const totalBudgets = budgets.length
    const totalItems = items.length
    const totalTasks = tasks.length
    const totalHours = budgets.reduce((sum, budget) => sum + (budget.total_hours || 0), 0)
    const activeBudgets = budgets.filter(budget => budget.csus?.length > 0).length
    const recentBudgets = budgets.slice(0, 3)

    return {
      totalBudgets,
      totalItems,
      totalTasks,
      totalHours,
      activeBudgets,
      recentBudgets
    }
  }

  const formatHours = (hours) => {
    if (!hours) return "0h"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }

  const stats = getStats()

  const featureCards = [
    {
      title: "Gerenciar Orçamentos",
      description: "Crie e organize seus orçamentos de projeto com casos de uso estruturados",
      icon: Calculator,
      color: "bg-blue-500",
      stats: `${stats.totalBudgets} orçamentos`,
      action: () => setCurrentPage('budgets'),
      quickAction: {
        label: "Novo Orçamento",
        action: () => openBudgetModal()
      }
    },
    {
      title: "Biblioteca de Itens",
      description: "Gerencie itens reutilizáveis compostos por tarefas para seus projetos",
      icon: Package,
      color: "bg-green-500",
      stats: `${stats.totalItems} itens`,
      action: () => setCurrentPage('items'),
      quickAction: {
        label: "Novo Item",
        action: () => openItemModal()
      }
    },
    {
      title: "Banco de Tarefas",
      description: "Configure tarefas com estimativas de tempo por complexidade",
      icon: Clock,
      color: "bg-purple-500",
      stats: `${stats.totalTasks} tarefas`,
      action: () => setCurrentPage('tasks'),
      quickAction: {
        label: "Nova Tarefa",
        action: () => openTaskModal()
      }
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sistema de Gerenciamento de Orçamentos
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize, calcule e gerencie seus projetos com precisão e eficiência
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button 
            size="lg" 
            onClick={() => openBudgetModal()}
            className="gap-2 text-lg px-8 py-6"
          >
            <Plus className="h-5 w-5" />
            Criar Novo Orçamento
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setCurrentPage('budgets')}
            className="text-lg px-8 py-6"
          >
            Ver Orçamentos Existentes
          </Button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Orçamentos"
          value={stats.totalBudgets}
          description="Projetos organizados"
          icon={Calculator}
          trend={stats.totalBudgets > 0 ? 12 : null}
        />
        <StatsCard
          title="Orçamentos Ativos"
          value={stats.activeBudgets}
          description="Com CSUs cadastrados"
          icon={FolderOpen}
        />
        <StatsCard
          title="Horas Estimadas"
          value={formatHours(stats.totalHours)}
          description="Total de trabalho"
          icon={Clock}
        />
        <StatsCard
          title="Recursos Disponíveis"
          value={stats.totalItems + stats.totalTasks}
          description="Itens e tarefas"
          icon={Package}
        />
      </div>

      {/* Cards de Funcionalidades */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Principais Funcionalidades</h2>
          <p className="text-muted-foreground">
            Acesse rapidamente as ferramentas de gestão de projetos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map((card, index) => (
            <ModernCard
              key={index}
              className="p-6 cursor-pointer group"
              onClick={card.action}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.color} text-white`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{card.stats}</Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation()
                      card.action()
                    }}
                    className="flex-1"
                  >
                    Gerenciar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      card.quickAction.action()
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {card.quickAction.label.split(' ')[1]}
                  </Button>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>

      {/* Orçamentos Recentes */}
      {stats.recentBudgets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Orçamentos Recentes</h2>
            <Button 
              variant="outline"
              onClick={() => setCurrentPage('budgets')}
            >
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentBudgets.map((budget) => (
              <ModernCard
                key={budget.id}
                className="p-4 cursor-pointer"
                onClick={() => setCurrentPage('budgets')}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold truncate">{budget.name}</h3>
                    <Badge variant={budget.csus?.length > 0 ? "default" : "secondary"}>
                      {budget.csus?.length > 0 ? "Ativo" : "Vazio"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>CSUs:</span>
                      <span>{budget.csus?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas:</span>
                      <span>{formatHours(budget.total_hours || 0)}</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {stats.totalBudgets === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Pronto para começar?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Crie seu primeiro orçamento e comece a organizar seus projetos de forma profissional.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => openTaskModal()}
              variant="outline"
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Começar com Tarefas
            </Button>
            <Button 
              size="lg"
              onClick={() => openBudgetModal()}
              className="gap-2"
            >
              <Calculator className="h-4 w-4" />
              Criar Primeiro Orçamento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
