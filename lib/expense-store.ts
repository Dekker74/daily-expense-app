import { promises as fs } from "fs" // turbo
import path from "path"
import type { Expense, ExpenseCategory } from "./expenses"

const DATA_FILE = path.join(process.cwd(), "data", "db.json")

// Helper to ensure data file exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf-8")
  }
}

// Helper to read expenses
async function readExpenses(): Promise<Expense[]> {
  await ensureDataFile()
  const data = await fs.readFile(DATA_FILE, "utf-8")
  try {
    return JSON.parse(data) as Expense[]
  } catch (error) {
    return []
  }
}

// Helper to write expenses
async function writeExpenses(expenses: Expense[]) {
  await ensureDataFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2), "utf-8")
}

export async function getExpenses(): Promise<Expense[]> {
  const expenses = await readExpenses()
  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function addExpense(data: {
  amount: number
  description: string
  category: ExpenseCategory
  date: string
}): Promise<Expense> {
  const expenses = await readExpenses()
  const expense: Expense = {
    id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...data,
    createdAt: new Date().toISOString(),
  }
  expenses.push(expense)
  await writeExpenses(expenses)
  return expense
}

export async function deleteExpense(id: string): Promise<boolean> {
  const expenses = await readExpenses()
  const idx = expenses.findIndex((e) => e.id === id)
  if (idx === -1) return false
  expenses.splice(idx, 1)
  await writeExpenses(expenses)
  return true
}

export async function getMonthlyTotal(month: number, year: number): Promise<number> {
  const expenses = await readExpenses()
  return expenses
    .filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

export async function getCategoryTotals(
  month: number,
  year: number
): Promise<{ category: ExpenseCategory; total: number }[]> {
  const expenses = await readExpenses()
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const totals: Partial<Record<ExpenseCategory, number>> = {}
  for (const e of monthExpenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount
  }

  return Object.entries(totals)
    .map(([category, total]) => ({
      category: category as ExpenseCategory,
      total: total as number,
    }))
    .sort((a, b) => b.total - a.total)
}

export async function getDailyTotals(
  month: number,
  year: number
): Promise<{ date: string; total: number }[]> {
  const expenses = await readExpenses()
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const dailyMap: Record<string, number> = {}
  for (const e of monthExpenses) {
    const dayKey = e.date.split("T")[0]
    dailyMap[dayKey] = (dailyMap[dayKey] || 0) + e.amount
  }

  return Object.entries(dailyMap)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

