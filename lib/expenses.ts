export type ExpenseCategory =
  | "alimentari"
  | "trasporti"
  | "casa"
  | "salute"
  | "svago"
  | "abbigliamento"
  | "ristorazione"
  | "altro"

export interface Expense {
  id: string
  amount: number
  description: string
  category: ExpenseCategory
  date: string // ISO string
  createdAt: string
}

export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  alimentari: { label: "Alimentari", icon: "ShoppingCart", color: "#2e9e6a" },
  trasporti: { label: "Trasporti", icon: "Car", color: "#2d8cbf" },
  casa: { label: "Casa", icon: "Home", color: "#d97706" },
  salute: { label: "Salute", icon: "Heart", color: "#dc2626" },
  svago: { label: "Svago", icon: "Gamepad2", color: "#7c3aed" },
  abbigliamento: { label: "Abbigliamento", icon: "Shirt", color: "#db2777" },
  ristorazione: { label: "Ristorazione", icon: "UtensilsCrossed", color: "#ea580c" },
  altro: { label: "Altro", icon: "MoreHorizontal", color: "#6b7280" },
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  })
}
