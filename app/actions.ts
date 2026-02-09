"use server"

import { generateText, Output } from "ai"
import { z } from "zod"
import {
  addExpense,
  deleteExpense,
  getExpenses,
  getMonthlyTotal,
  getCategoryTotals,
  getDailyTotals,
} from "@/lib/expense-store"
import type { ExpenseCategory } from "@/lib/expenses"

export async function getExpensesAction() {
  return getExpenses()
}

export async function addExpenseAction(data: {
  amount: number
  description: string
  category: ExpenseCategory
  date: string
}) {
  return addExpense(data)
}

export async function deleteExpenseAction(id: string) {
  return deleteExpense(id)
}

export async function getMonthlyStatsAction(month: number, year: number) {
  const total = await getMonthlyTotal(month, year)
  const categoryTotals = await getCategoryTotals(month, year)
  const dailyTotals = await getDailyTotals(month, year)
  return { total, categoryTotals, dailyTotals }
}


export async function scanReceiptAction(imageBase64: string) {
  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageBase64,
          },
          {
            type: "text",
            text: `Analizza questo scontrino e restituisci SOLO un oggetto JSON con questi campi:
- "amount": il totale in numero (es. 42.50)
- "description": breve descrizione degli articoli principali
- "category": una tra queste categorie: "alimentari", "trasporti", "casa", "salute", "svago", "abbigliamento", "ristorazione", "altro"
- "date": la data dello scontrino in formato ISO (YYYY-MM-DD), se non visibile usa la data di oggi

Rispondi SOLO con il JSON, senza markdown o altro testo.`,
          },
        ],
      },
    ],
    output: Output.object({
      schema: z.object({
        amount: z.number(),
        description: z.string(),
        category: z.enum([
          "alimentari",
          "trasporti",
          "casa",
          "salute",
          "svago",
          "abbigliamento",
          "ristorazione",
          "altro",
        ]),
        date: z.string(),
      }),
    }),
  })

  return text
}
