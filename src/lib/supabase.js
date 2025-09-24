import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
// NOTA: Estas são variáveis de exemplo. Em produção, use variáveis de ambiente.
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de complexidade para as tarefas
export const COMPLEXITY_TYPES = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  VERY_HIGH: 'very_high'
}

// Labels para exibição
export const COMPLEXITY_LABELS = {
  [COMPLEXITY_TYPES.LOW]: 'Baixa',
  [COMPLEXITY_TYPES.MEDIUM]: 'Média',
  [COMPLEXITY_TYPES.HIGH]: 'Alta',
  [COMPLEXITY_TYPES.VERY_HIGH]: 'Altíssima'
}

// Cores para os badges de complexidade
export const COMPLEXITY_COLORS = {
  [COMPLEXITY_TYPES.LOW]: 'bg-green-100 text-green-800',
  [COMPLEXITY_TYPES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [COMPLEXITY_TYPES.HIGH]: 'bg-orange-100 text-orange-800',
  [COMPLEXITY_TYPES.VERY_HIGH]: 'bg-red-100 text-red-800'
}
