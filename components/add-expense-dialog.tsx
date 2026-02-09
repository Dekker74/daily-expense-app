"use client"

import React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORY_CONFIG, type ExpenseCategory } from "@/lib/expenses"
import { CategoryIcon } from "./category-icon"

export function AddExpenseDialog({
  open,
  onOpenChange,
  onAdd,
  initialData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: {
    amount: number
    description: string
    category: ExpenseCategory
    date: string
  }) => void
  initialData?: {
    amount?: number
    description?: string
    category?: ExpenseCategory
    date?: string
  }
}) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [category, setCategory] = useState<ExpenseCategory>(initialData?.category || "altro")
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (initialData) {
      if (initialData.amount) setAmount(initialData.amount.toString())
      if (initialData.description) setDescription(initialData.description)
      if (initialData.category) setCategory(initialData.category)
      if (initialData.date) setDate(initialData.date)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return
    onAdd({
      amount: parsedAmount,
      description: description || "Spesa",
      category,
      date: new Date(date).toISOString(),
    })
    setAmount("")
    setDescription("")
    setCategory("altro")
    setDate(new Date().toISOString().split("T")[0])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Spesa</DialogTitle>
          <DialogDescription>Inserisci i dettagli della spesa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Importo</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg font-semibold"
                required
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {"€"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              placeholder="Es. Spesa settimanale"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-all ${
                    category === cat
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <CategoryIcon category={cat} size="sm" />
                  <span className="text-foreground font-medium truncate w-full text-center">
                    {CATEGORY_CONFIG[cat].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Aggiungi Spesa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
