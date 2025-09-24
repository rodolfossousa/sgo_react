import { Badge } from "./badge"
import { cn } from "@/lib/utils"
import { COMPLEXITY_COLORS, COMPLEXITY_LABELS } from "@/lib/supabase"

// Badge específico para complexidades
export const ComplexityBadge = ({ complexity, className, ...props }) => {
  const colorClass = COMPLEXITY_COLORS[complexity] || "bg-gray-100 text-gray-800"
  const label = COMPLEXITY_LABELS[complexity] || complexity

  return (
    <Badge
      variant="outline"
      className={cn(
        colorClass,
        "font-medium border-0",
        className
      )}
      {...props}
    >
      {label}
    </Badge>
  )
}
