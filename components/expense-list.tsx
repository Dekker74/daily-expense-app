"use client"

import { Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Expense } from "@/lib/expenses"
import { CATEGORY_CONFIG, formatCurrency, formatDateShort } from "@/lib/expenses"
import { CategoryIcon } from "./category-icon"
import { Button } from "@/components/ui/button"

export function ExpenseList({
  expenses,
  onDelete,
}: {
  expenses: Expense[]
  onDelete: (id: string) => void
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Nessuna spesa registrata</p>
        <p className="text-sm">Aggiungi una spesa o scansiona uno scontrino</p>
      </div>
    )
  }

  // Group by date
  const grouped: Record<string, Expense[]> = {}
  for (const exp of expenses) {
    const dayKey = exp.date.split("T")[0]
    if (!grouped[dayKey]) grouped[dayKey] = []
    grouped[dayKey].push(exp)
  }

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col gap-6">
      {sortedDays.map((day, dayIndex) => {
        const dayExpenses = grouped[day]
        const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0)
        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-muted-foreground">
                {formatDateShort(day)}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(dayTotal)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <AnimatePresence mode="popLayout">
                {dayExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="glass-card group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                  >
                    <CategoryIcon category={expense.category} />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-card-foreground">
                        {expense.description}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_CONFIG[expense.category].label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-card-foreground tabular-nums">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => onDelete(expense.id)}
                      aria-label={`Elimina ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

