import { useState } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export const SearchInput = ({ 
  placeholder = "Buscar...",
  value,
  onChange,
  onClear,
  className,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    onChange("")
    if (onClear) onClear()
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className={cn(
          "h-4 w-4 transition-colors",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-10 pr-10"
        {...props}
      />
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

// Barra de busca com filtros
export const SearchBar = ({ 
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  className,
  children
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-start sm:items-center", className)}>
      <div className="flex-1 w-full sm:w-auto">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Buscar..."
        />
      </div>
      
      {filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter, index) => (
            <div key={index}>{filter}</div>
          ))}
        </div>
      )}
      
      {children && (
        <div className="flex gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
