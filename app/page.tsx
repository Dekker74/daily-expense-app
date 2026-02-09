"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  ScanLine,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Receipt,
  PieChart
} from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExpenseList } from "@/components/expense-list"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { ReceiptScanner } from "@/components/receipt-scanner"
import { DailyBarChart, CategoryPieChart } from "@/components/monthly-chart"
import { formatCurrency, type ExpenseCategory } from "@/lib/expenses"
import type { Expense } from "@/lib/expenses"
import {
  getExpensesAction,
  addExpenseAction,
  deleteExpenseAction,
  getMonthlyStatsAction,
} from "@/app/actions"
import { ModeToggle } from "@/components/theme-toggle"

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
]

export default function Page() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<{
    total: number
    categoryTotals: { category: ExpenseCategory; total: number }[]
    dailyTotals: { date: string; total: number }[]
  } | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [scanData, setScanData] = useState<{
    amount?: number
    description?: string
    category?: ExpenseCategory
    date?: string
  } | null>(null)

  const loadData = useCallback(async () => {
    const [expData, statsData] = await Promise.all([
      getExpensesAction(),
      getMonthlyStatsAction(month, year),
    ])
    setExpenses(expData)
    setStats(statsData)
  }, [month, year])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddExpense = async (data: {
    amount: number
    description: string
    category: ExpenseCategory
    date: string
  }) => {
    await addExpenseAction(data)
    loadData()
  }

  const handleDelete = async (id: string) => {
    await deleteExpenseAction(id)
    loadData()
  }

  const handleScanComplete = (data: {
    amount: number
    description: string
    category: ExpenseCategory
    date: string
  }) => {
    setScanData(data)
    setScanOpen(false)
    setAddOpen(true)
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Filter expenses for current month
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const prevMonthIdx = month === 0 ? 11 : month - 1
  const prevYr = month === 0 ? year - 1 : year
  const prevExpenses = expenses.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === prevMonthIdx && d.getFullYear() === prevYr
  })
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0)
  const currentTotal = stats?.total || 0
  const diff = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0
  const isUp = diff > 0

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col bg-background pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-lg transition-colors duration-300">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-bold text-foreground">SpesApp</h1>
          </div>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={prevMonth} aria-label="Mese precedente">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[100px] text-center text-sm font-semibold text-foreground">
                {MONTH_NAMES[month]} {year}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={nextMonth} aria-label="Mese successivo">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 p-4"
      >
        {/* Summary card */}
        <Card className="glass-card overflow-hidden border-0 bg-primary p-0 text-primary-foreground shadow-xl">
          <div className="modern-gradient flex flex-col gap-1 p-5">
            <span className="text-sm font-medium text-primary-foreground/80">
              Totale {MONTH_NAMES[month]}
            </span>
            <span className="text-4xl font-bold tracking-tight">
              {formatCurrency(currentTotal)}
            </span>
            <div className="mt-2 flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 w-fit backdrop-blur-sm">
              {isUp ? (
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              ) : (
                <TrendingDown className="h-4 w-4 text-primary-foreground" />
              )}
              <span className="text-xs font-medium text-primary-foreground">
                {diff > 0 ? "+" : ""}
                {diff.toFixed(1)}% vs mese prec.
              </span>
            </div>
          </div>
          <div className="flex border-t border-white/10 bg-black/5 backdrop-blur-sm">
            <div className="flex flex-1 flex-col items-center py-3 transition-colors hover:bg-white/5">
              <span className="text-xs text-primary-foreground/70">Transazioni</span>
              <span className="text-lg font-bold">
                {monthExpenses.length}
              </span>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex flex-1 flex-col items-center py-3 transition-colors hover:bg-white/5">
              <span className="text-xs text-primary-foreground/70">Media/giorno</span>
              <span className="text-lg font-bold">
                {formatCurrency(
                  monthExpenses.length > 0
                    ? currentTotal / new Set(monthExpenses.map((e) => e.date.split("T")[0])).size
                    : 0
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
            <TabsTrigger value="expenses" className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Receipt className="mr-1.5 h-4 w-4" />
              Spese
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <PieChart className="mr-1.5 h-4 w-4" />
              Riepilogo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="mt-4">
            <ExpenseList expenses={monthExpenses} onDelete={handleDelete} />
          </TabsContent>

          <TabsContent value="summary" className="mt-4 flex flex-col gap-4">
            {stats && stats.dailyTotals.length > 0 ? (
              <>
                <Card className="glass-card p-4">
                  <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                    Spese Giornaliere
                  </h3>
                  <DailyBarChart data={stats.dailyTotals} />
                </Card>
                <Card className="glass-card p-4">
                  <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                    Per Categoria
                  </h3>
                  <CategoryPieChart data={stats.categoryTotals} />
                </Card>
                <Card className="glass-card p-4">
                  <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                    Dettaglio Categorie
                  </h3>
                  <div className="flex flex-col gap-4">
                    {stats.categoryTotals.map((ct) => {
                      const pct =
                        currentTotal > 0
                          ? ((ct.total / currentTotal) * 100).toFixed(1)
                          : "0"
                      return (
                        <div key={ct.category} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {
                                  {
                                    alimentari: "Alimentari",
                                    trasporti: "Trasporti",
                                    casa: "Casa",
                                    salute: "Salute",
                                    svago: "Svago",
                                    abbigliamento: "Abbigliamento",
                                    ristorazione: "Ristorazione",
                                    altro: "Altro",
                                  }[ct.category]
                                }
                              </span>
                              <span className="text-sm font-bold tabular-nums text-foreground">
                                {formatCurrency(ct.total)}
                              </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor:
                                    {
                                      alimentari: "#2e9e6a",
                                      trasporti: "#2d8cbf",
                                      casa: "#d97706",
                                      salute: "#dc2626",
                                      svago: "#7c3aed",
                                      abbigliamento: "#db2777",
                                      ristorazione: "#ea580c",
                                      altro: "#6b7280",
                                    }[ct.category],
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground hover:text-foreground transition-colors">
                <Receipt className="mb-4 h-12 w-12 opacity-20" />
                <p className="text-lg font-medium">Nessun dato disponibile</p>
                <p className="text-sm">Aggiungi delle spese per vedere il riepilogo</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* FAB Actions */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <Button
          size="lg"
          variant="secondary"
          className="h-14 gap-2 rounded-full px-6 shadow-xl border border-border backdrop-blur-xl bg-background/80 hover:bg-background/90"
          onClick={() => setScanOpen(true)}
        >
          <ScanLine className="h-5 w-5" />
          <span className="font-semibold">Scansiona</span>
        </Button>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-xl bg-primary hover:bg-primary/90 modern-gradient"
          onClick={() => {
            setScanData(null)
            setAddOpen(true)
          }}
          aria-label="Aggiungi spesa"
        >
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </div>

      {/* Dialogs */}
      <AddExpenseDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAddExpense}
        initialData={scanData || undefined}
      />
      <ReceiptScanner
        open={scanOpen}
        onOpenChange={setScanOpen}
        onScanComplete={handleScanComplete}
      />
    </main>
  )
}

