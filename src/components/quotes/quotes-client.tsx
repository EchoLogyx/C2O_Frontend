"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import { Search, ArrowUpDown, MoreHorizontal, Eye } from "lucide-react"
import { Quote, QuoteStatus } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatDate, STATUS_COLOURS, TIER_COLOURS, cn } from "@/lib/utils"

const STATUSES: QuoteStatus[] = ["New", "Contacted", "Quoted", "Won", "Lost"]

interface QuotesClientProps {
  initialQuotes: Quote[]
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_COLOURS[status])}>
      {status}
    </span>
  )
}

export function QuotesClient({ initialQuotes }: QuotesClientProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewQuote, setViewQuote] = useState<Quote | null>(null)

  const statusCounts = useMemo(() => {
    return STATUSES.reduce((acc, s) => {
      acc[s] = quotes.filter((q) => q.status === s).length
      return acc
    }, {} as Record<QuoteStatus, number>)
  }, [quotes])

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false
      if (globalFilter) {
        const query = globalFilter.toLowerCase()
        return (
          q.customerName.toLowerCase().includes(query) ||
          q.quoteNumber.toLowerCase().includes(query) ||
          q.product.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [quotes, statusFilter, globalFilter])

  const updateStatus = (id: string, status: QuoteStatus) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q))
    )
    setViewQuote(null)
  }

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "quoteNumber",
      header: "Quote #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-slate-700">{row.getValue("quoteNumber")}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting()}>
          Customer <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-slate-900">{row.getValue("customerName")}</p>
          <p className="text-xs text-slate-500">{row.original.customerEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-sm">{row.getValue("category")}</span>,
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700 line-clamp-1 max-w-[180px]">{row.getValue("product")}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue<number>("quantity").toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "tier",
      header: "Tier",
      cell: ({ row }) => {
        const tier = row.getValue<string>("tier")
        return (
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", TIER_COLOURS[tier])}>
            {tier}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{formatDate(row.getValue("createdAt"))}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const quote = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewQuote(quote)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {STATUSES.filter((s) => s !== quote.status).map((s) => (
                <DropdownMenuItem key={s} onClick={() => updateStatus(quote.id, s)}>
                  Move to {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredQuotes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
        <p className="mt-1 text-sm text-slate-500">{quotes.length} total quotes</p>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-medium transition-colors",
            statusFilter === "all"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          All ({quotes.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {s} ({statusCounts[s]})
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by customer, quote number or product..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-t border-slate-100">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="cursor-pointer" onClick={() => setViewQuote(row.original)}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                    No quotes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Showing {table.getRowModel().rows.length} of {filteredQuotes.length} quotes
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Quote Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewQuote?.quoteNumber}</DialogTitle>
            <DialogDescription>{viewQuote?.customerName} · {viewQuote?.customerEmail}</DialogDescription>
          </DialogHeader>
          {viewQuote && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="font-medium">{viewQuote.category}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Tier</p>
                  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1", TIER_COLOURS[viewQuote.tier])}>
                    {viewQuote.tier}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p className="font-medium">{viewQuote.quantity.toLocaleString()} units</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Status</p>
                  <StatusBadge status={viewQuote.status} />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Product</p>
                <p className="font-medium">{viewQuote.product}</p>
              </div>
              {viewQuote.notes && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Notes</p>
                  <p className="text-slate-700">{viewQuote.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="font-medium">{formatDate(viewQuote.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Updated</p>
                  <p className="font-medium">{formatDate(viewQuote.updatedAt)}</p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-slate-500">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={s === viewQuote.status ? "default" : "outline"}
                      onClick={() => updateStatus(viewQuote.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
