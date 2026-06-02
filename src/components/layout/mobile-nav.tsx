"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Tag,
  Layers,
  FileText,
  Upload,
  Menu,
  X,
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold">QuoteAI Admin</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <nav className="space-y-0.5 p-4">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
