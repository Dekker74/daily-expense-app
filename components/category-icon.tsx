"use client"

import React from "react"

import {
  ShoppingCart,
  Car,
  Home,
  Heart,
  Gamepad2,
  Shirt,
  UtensilsCrossed,
  MoreHorizontal,
} from "lucide-react"
import type { ExpenseCategory } from "@/lib/expenses"
import { CATEGORY_CONFIG } from "@/lib/expenses"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Car,
  Home,
  Heart,
  Gamepad2,
  Shirt,
  UtensilsCrossed,
  MoreHorizontal,
}

export function CategoryIcon({
  category,
  size = "md",
}: {
  category: ExpenseCategory
  size?: "sm" | "md" | "lg"
}) {
  const config = CATEGORY_CONFIG[category]
  const Icon = iconMap[config.icon] || MoreHorizontal

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-xl`}
      style={{ backgroundColor: `${config.color}18` }}
    >
      <Icon className={iconSizeClasses[size]} style={{ color: config.color }} />
    </div>
  )
}
