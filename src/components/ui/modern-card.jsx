import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

// Card moderno com hover effects e estados
export const ModernCard = ({ 
  children, 
  className, 
  hover = true, 
  selected = false,
  onClick,
  ...props 
}) => {
  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer",
        hover && "hover:shadow-lg hover:-translate-y-1",
        selected && "ring-2 ring-primary ring-offset-2",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Card>
  )
}

// Card para estatísticas
export const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className,
  ...props 
}) => {
  return (
    <ModernCard className={cn("p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend > 0 ? "text-green-600" : "text-red-600"
              )}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </ModernCard>
  )
}

// Card para itens de lista
export const ListCard = ({ 
  title, 
  description, 
  badges = [], 
  actions,
  selected = false,
  onClick,
  className,
  children,
  ...props 
}) => {
  return (
    <ModernCard
      selected={selected}
      onClick={onClick}
      className={cn("p-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            {badges.map((badge, index) => (
              <span key={index}>{badge}</span>
            ))}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex items-center space-x-1 ml-4">
            {actions}
          </div>
        )}
      </div>
    </ModernCard>
  )
}

// Card expansível (accordion-like)
export const ExpandableCard = ({ 
  title, 
  description, 
  badges = [],
  expanded = false,
  onToggle,
  children,
  actions,
  className,
  ...props 
}) => {
  return (
    <ModernCard className={cn("overflow-hidden", className)} hover={false} {...props}>
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{title}</h3>
              {badges.map((badge, index) => (
                <span key={index}>{badge}</span>
              ))}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            <div className={cn(
              "transition-transform duration-200",
              expanded ? "rotate-180" : "rotate-0"
            )}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t bg-muted/20 p-4">
          {children}
        </div>
      )}
    </ModernCard>
  )
}
