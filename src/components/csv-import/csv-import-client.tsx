"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2, X, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const REQUIRED_FIELDS = ["name", "category", "brand", "tier", "price", "code"]

interface ParsedRow {
  [key: string]: string
}

interface ValidationResult {
  rowIndex: number
  errors: string[]
  data: ParsedRow
}

function parseCsv(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase())
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))
    return headers.reduce((acc, h, i) => {
      acc[h] = values[i] ?? ""
      return acc
    }, {} as ParsedRow)
  })
  return { headers, rows }
}

function validateRows(headers: string[], rows: ParsedRow[]): ValidationResult[] {
  return rows.map((row, i) => {
    const errors: string[] = []
    REQUIRED_FIELDS.forEach((field) => {
      if (!headers.includes(field)) {
        errors.push(`Missing column: "${field}"`)
      } else if (!row[field]) {
        errors.push(`Empty required field: "${field}"`)
      }
    })
    if (row.price && isNaN(parseFloat(row.price))) {
      errors.push("Price must be a number")
    }
    const validTiers = ["Budget", "Everyday", "Premium", "Retail", "Designer"]
    if (row.tier && !validTiers.includes(row.tier)) {
      errors.push(`Invalid tier: "${row.tier}"`)
    }
    return { rowIndex: i + 2, errors, data: row }
  })
}

const SAMPLE_CSV = `name,category,brand,tier,price,code,colours,sizes,gender,nextDay
Fruit of the Loom Original T-Shirt,t-shirts,Fruit of the Loom,Budget,4.50,FOL-OT,"White,Black,Navy",S;M;L;XL,Unisex,true
Gildan Softstyle T-Shirt,t-shirts,Gildan,Budget,5.25,GIL-SS,"White,Black,Navy,Red",S;M;L;XL;2XL,Unisex,false
AWDis Cool Polo,polo-shirts,AWDis,Budget,8.99,AWD-CP,"White,Black,Navy",XS;S;M;L;XL,Unisex,true`

export function CsvImportClient() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [imported, setImported] = useState(false)

  const processFile = (f: File) => {
    setFile(f)
    setImported(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const { headers, rows } = parseCsv(text)
        const results = validateRows(headers, rows)
        setHeaders(headers)
        setRows(rows)
        setValidationResults(results)
      } catch {
        alert("Failed to parse CSV. Please check the file format.")
      }
    }
    reader.readAsText(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === "text/csv" || f?.name.endsWith(".csv")) {
      processFile(f)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const validCount = validationResults.filter((r) => r.errors.length === 0).length
  const errorCount = validationResults.filter((r) => r.errors.length > 0).length

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-products.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">CSV Import</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload a CSV file to preview and import products in bulk.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Required fields info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required CSV Columns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_FIELDS.map((field) => (
              <span key={field} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                {field}
              </span>
            ))}
            <span className="rounded-md border border-slate-100 bg-white px-2 py-1 font-mono text-xs text-slate-400">
              colours (optional)
            </span>
            <span className="rounded-md border border-slate-100 bg-white px-2 py-1 font-mono text-xs text-slate-400">
              sizes (optional)
            </span>
            <span className="rounded-md border border-slate-100 bg-white px-2 py-1 font-mono text-xs text-slate-400">
              nextDay (optional)
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Valid tiers: Budget · Everyday · Premium · Retail · Designer
          </p>
        </CardContent>
      </Card>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors",
          isDragging
            ? "border-slate-900 bg-slate-50"
            : "border-slate-200 bg-white hover:border-slate-300"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Upload className="h-6 w-6 text-slate-500" />
        </div>
        <p className="mt-4 text-base font-medium text-slate-900">
          {isDragging ? "Drop your CSV file here" : "Drag & drop your CSV file"}
        </p>
        <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        {file && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                setRows([])
                setHeaders([])
                setValidationResults([])
              }}
              className="ml-2 rounded hover:bg-slate-200 p-0.5"
            >
              <X className="h-3 w-3 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* Import Summary */}
      {rows.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <FileText className="h-8 w-8 text-slate-400" />
                <div>
                  <p className="text-2xl font-bold">{rows.length}</p>
                  <p className="text-sm text-slate-500">Total rows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-sm text-slate-500">Valid rows</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-sm text-slate-500">Rows with errors</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Preview ({rows.length} rows)</CardTitle>
                  <CardDescription>Review your data before importing</CardDescription>
                </div>
                <Button
                  onClick={() => setImported(true)}
                  disabled={validCount === 0 || imported}
                >
                  {imported ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Imported!</>
                  ) : (
                    `Import ${validCount} valid rows`
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-t border-slate-100">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Status</TableHead>
                      {headers.slice(0, 6).map((h) => (
                        <TableHead key={h} className="capitalize">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.map((result) => (
                      <TableRow key={result.rowIndex} className={result.errors.length > 0 ? "bg-red-50" : ""}>
                        <TableCell className="text-xs text-slate-400">{result.rowIndex}</TableCell>
                        <TableCell>
                          {result.errors.length === 0 ? (
                            <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Valid</Badge>
                          ) : (
                            <div className="space-y-0.5">
                              <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Error</Badge>
                              {result.errors.map((err, i) => (
                                <p key={i} className="text-xs text-red-600">{err}</p>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        {headers.slice(0, 6).map((h) => (
                          <TableCell key={h} className="text-sm">
                            {result.data[h] || <span className="text-slate-300">—</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
