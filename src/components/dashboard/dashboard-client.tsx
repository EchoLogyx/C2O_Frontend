"use client"

import { Package, Tag, FileText, TrendingUp, ArrowUpRight, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardStats, Quote, Category } from "@/types"
import { formatCurrency, formatDate, STATUS_COLOURS } from "@/lib/utils"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardClientProps {
  stats: DashboardStats
  recentQuotes: Quote[]
  categories: Category[]
}

const statCards = (stats: DashboardStats) => [
  {
    title: "Total Products",
    value: stats.totalProducts,
    sub: `${stats.activeProducts} active`,
    icon: Package,
    colour: "text-blue-600",
    bg: "bg-blue-50",
    href: "/products",
  },
  {
    title: "Categories",
    value: stats.totalCategories,
    sub: `${stats.featuredCategories} featured`,
    icon: Tag,
    colour: "text-purple-600",
    bg: "bg-purple-50",
    href: "/categories",
  },
  {
    title: "Total Quotes",
    value: stats.totalQuotes,
    sub: `${stats.newQuotes} new this week`,
    icon: FileText,
    colour: "text-amber-600",
    bg: "bg-amber-50",
    href: "/quotes",
  },
  {
    title: "Won Quotes",
    value: stats.wonQuotes,
    sub: `${Math.round((stats.wonQuotes / Math.max(stats.totalQuotes, 1)) * 100)}% win rate`,
    icon: TrendingUp,
    colour: "text-green-600",
    bg: "bg-green-50",
    href: "/quotes",
  },
]

export function DashboardClient({ stats, recentQuotes, categories }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome to QuoteAI Admin. Here&apos;s your product and quote overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards(stats).map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.colour)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Quotes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Quotes</CardTitle>
                <CardDescription>Latest quote activity</CardDescription>
              </div>
              <Link href="/quotes" className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">{quote.customerName}</p>
                        <span className="text-xs text-slate-400">{quote.quoteNumber}</span>
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {quote.product} · {quote.quantity} units
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", STATUS_COLOURS[quote.status])}>
                        {quote.status}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:block">{formatDate(quote.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Product category overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
                        {cat.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.productCount} products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      {cat.featured && (
                        <Badge variant="info" className="text-xs">Featured</Badge>
                      )}
                      {cat.visible ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link href="/categories" className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2">
                  Manage categories →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
