import { cn } from "@/lib/utils"
import { Button } from "./button"

export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 space-y-4",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
      
      {action && actionLabel && (
        <Button onClick={action} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
