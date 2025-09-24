import { cn } from "@/lib/utils"

// Spinner simples
export const Spinner = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      {...props}
    >
      <span className="sr-only">Carregando...</span>
    </div>
  )
}

// Loading overlay
export const LoadingOverlay = ({ isLoading, children, className }) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-2">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton para cards
export const CardSkeleton = ({ className }) => {
  return (
    <div className={cn("p-4 border rounded-lg space-y-3", className)}>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
      </div>
      <div className="flex space-x-2">
        <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
        <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
      </div>
    </div>
  )
}

// Skeleton para lista
export const ListSkeleton = ({ count = 3, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Loading state para botões
export const ButtonLoading = ({ children, isLoading, ...props }) => {
  return (
    <button disabled={isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Spinner className="h-4 w-4" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
