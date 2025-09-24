import { useState } from "react"
import { Home, Calculator, Package, Clock, Menu, X, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"

export default function Navigation() {
  const { currentPage, setCurrentPage, budgets, items, tasks, user } = useAppStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      count: null
    },
    {
      id: 'budgets',
      label: 'Orçamentos',
      icon: Calculator,
      count: budgets.length
    },
    {
      id: 'items',
      label: 'Itens',
      icon: Package,
      count: items.length
    },
    {
      id: 'tasks',
      label: 'Tarefas',
      icon: Clock,
      count: tasks.length
    }
  ]

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">SGO</h1>
              <p className="text-xs text-muted-foreground">Sistema de Orçamentos</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                onClick={() => handleNavigation(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.count !== null && item.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center space-x-2">
            {/* User Avatar */}
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {user?.email?.split('@')[0] || 'Usuário'}
              </span>
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-2 space-y-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  onClick={() => handleNavigation(item.id)}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.count !== null && item.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              ))}
              
              {/* Mobile User Options */}
              <div className="pt-2 border-t space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-3 w-3" />
            <span>/</span>
            <span className="font-medium text-foreground">
              {navigationItems.find(item => item.id === currentPage)?.label || 'Página'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
