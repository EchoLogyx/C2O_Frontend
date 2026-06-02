"use client"

import { useState } from "react"
import { Package, ChevronDown, ChevronUp, Power, PowerOff } from "lucide-react"
import { TierConfig, Product } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, cn } from "@/lib/utils"

interface TiersClientProps {
  initialTiers: TierConfig[]
  allProducts: Product[]
}

export function TiersClient({ initialTiers, allProducts }: TiersClientProps) {
  const [tiers, setTiers] = useState<TierConfig[]>(initialTiers)
  const [expandedTier, setExpandedTier] = useState<string | null>(initialTiers[0]?.id ?? null)

  const toggleActive = (id: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    )
  }

  const getTierProducts = (tier: TierConfig) => {
    return allProducts.filter((p) => tier.productIds.includes(p.id))
  }

  const TIER_BG: Record<string, string> = {
    Budget: "bg-green-500",
    Everyday: "bg-blue-500",
    Premium: "bg-purple-500",
    Retail: "bg-amber-500",
    Designer: "bg-red-500",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tier Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure product tiers, pricing ranges and display order.
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {tiers.map((tier) => (
          <Card key={tier.id} className={cn("text-center", !tier.active && "opacity-50")}>
            <CardContent className="p-4">
              <div
                className={cn("mx-auto mb-2 h-3 w-3 rounded-full", TIER_BG[tier.name])}
              />
              <p className="text-xs font-semibold text-slate-900">{tier.name}</p>
              <p className="text-xs text-slate-500">
                {formatCurrency(tier.priceMin)}–{formatCurrency(tier.priceMax)}
              </p>
              <p className="mt-1 text-lg font-bold">{tier.productIds.length}</p>
              <p className="text-xs text-slate-400">products</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier details */}
      <div className="space-y-4">
        {tiers.map((tier) => {
          const tierProducts = getTierProducts(tier)
          const isExpanded = expandedTier === tier.id

          return (
            <Card key={tier.id} className={cn(!tier.active && "opacity-60")}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-4 w-4 rounded-full", TIER_BG[tier.name])} />
                    <div>
                      <CardTitle className="text-base">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">
                        {formatCurrency(tier.priceMin)} – {formatCurrency(tier.priceMax)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {tierProducts.length} products
                      </span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-slate-500">Active</span>
                      <Switch
                        checked={tier.active}
                        onCheckedChange={() => toggleActive(tier.id)}
                      />
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Products in this tier ({tierProducts.length})
                    </p>
                    <p className="text-xs text-slate-400">
                      Display order: #{tier.displayOrder}
                    </p>
                  </div>
                  {tierProducts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
                      <p className="text-sm text-slate-400">No products assigned to this tier</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {tierProducts.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "flex items-center justify-between rounded-lg border border-slate-100 p-3",
                            !product.active && "opacity-50"
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">
                              {product.brand} · {formatCurrency(product.price)}
                            </p>
                          </div>
                          <Badge
                            variant={product.active ? "success" : "secondary"}
                            className="ml-2 shrink-0 text-xs"
                          >
                            {product.active ? "On" : "Off"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
