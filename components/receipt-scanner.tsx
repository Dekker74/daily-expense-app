"use client"

import React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, Loader2, ScanLine } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { scanReceiptAction } from "@/app/actions"
import type { ExpenseCategory } from "@/lib/expenses"

export function ReceiptScanner({
  open,
  onOpenChange,
  onScanComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanComplete: (data: {
    amount: number
    description: string
    category: ExpenseCategory
    date: string
  }) => void
}) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setScanning(true)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setPreview(base64)
      const result = await scanReceiptAction(base64)
      if (result) {
        onScanComplete({
          amount: result.amount,
          description: result.description,
          category: result.category as ExpenseCategory,
          date: result.date,
        })
        setPreview(null)
        onOpenChange(false)
      } else {
        setError("Non sono riuscito a leggere lo scontrino. Riprova.")
      }
    } catch {
      setError("Errore durante la scansione. Riprova.")
    } finally {
      setScanning(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!scanning) {
          onOpenChange(v)
          setPreview(null)
          setError(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scansiona Scontrino</DialogTitle>
          <DialogDescription>
            Fotografa o carica lo scontrino per inserire automaticamente la spesa
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || "/placeholder.svg"}
                alt="Anteprima scontrino"
                className="w-full max-h-64 object-contain bg-muted"
              />
              {scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="relative">
                    <ScanLine className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Analisi in corso...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/50 hover:bg-primary/10"
                disabled={scanning}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground">Scatta Foto</span>
                  <span className="text-xs text-muted-foreground">
                    Usa la fotocamera del dispositivo
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/50"
                disabled={scanning}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground">Carica Immagine</span>
                  <span className="text-xs text-muted-foreground">
                    Seleziona dalla galleria
                  </span>
                </div>
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {scanning && !preview && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Analisi in corso...</span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview && !scanning && (
          <Button
            variant="outline"
            onClick={() => {
              setPreview(null)
              setError(null)
            }}
          >
            Riprova
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
