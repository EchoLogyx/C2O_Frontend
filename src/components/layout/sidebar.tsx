"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  FileText,
  Upload,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Tiers", href: "/tiers", icon: Layers },
  { name: "Quotes", href: "/quotes", icon: FileText },
  { name: "CSV Import", href: "/csv-import", icon: Upload },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">QuoteAI Admin</p>
          <p className="text-xs text-slate-500">Product Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Menu
        </p>
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
              {active && (
                <ChevronRight className="ml-auto h-3 w-3 opacity-70" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">Admin User</p>
            <p className="truncate text-xs text-slate-500">admin@c2o.co.uk</p>
          </div>
        </div>
      </div>
    </div>
  )
}
