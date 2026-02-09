"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { CATEGORY_CONFIG, formatCurrency, type ExpenseCategory } from "@/lib/expenses"

interface CategoryTotal {
  category: ExpenseCategory
  total: number
}

interface DailyTotal {
  date: string
  total: number
}

export function DailyBarChart({ data }: { data: DailyTotal[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    }),
  }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 16%, 89%)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Spesa"]}
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(214, 16%, 89%)",
              borderRadius: "12px",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="total" fill="#2e9e6a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryPieChart({ data }: { data: CategoryTotal[] }) {
  const chartData = data.map((d) => ({
    name: CATEGORY_CONFIG[d.category].label,
    value: d.total,
    color: CATEGORY_CONFIG[d.category].color,
  }))

  const total = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="flex items-center gap-4">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value)]}
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 16%, 89%)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {data.slice(0, 5).map((d) => {
          const pct = total > 0 ? ((d.total / total) * 100).toFixed(0) : "0"
          return (
            <div key={d.category} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_CONFIG[d.category].color }}
              />
              <span className="text-xs text-muted-foreground flex-1 truncate">
                {CATEGORY_CONFIG[d.category].label}
              </span>
              <span className="text-xs font-medium text-foreground tabular-nums">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
