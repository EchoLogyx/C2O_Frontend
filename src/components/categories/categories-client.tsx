"use client"

import { useState } from "react"
import { Eye, EyeOff, Star, Package } from "lucide-react"
import { Category } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoriesClientProps {
  initialCategories: Category[]
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const toggleVisibility = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    )
  }

  const toggleFeatured = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, featured: !c.featured } : c))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product categories, visibility and featured status.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Total Categories</p>
            <p className="mt-1 text-3xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Visible</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {categories.filter((c) => c.visible).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Featured</p>
            <p className="mt-1 text-3xl font-bold text-amber-600">
              {categories.filter((c) => c.featured).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "transition-all",
              !category.visible && "opacity-60"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                    {category.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{category.name}</h3>
                      {category.featured && (
                        <Badge variant="warning" className="text-xs">
                          <Star className="mr-1 h-2.5 w-2.5" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{category.description}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Package className="h-3.5 w-3.5" />
                      {category.productCount} products · Order #{category.displayOrder}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    {category.visible ? (
                      <Eye className="h-4 w-4 text-slate-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-300" />
                    )}
                    <span className="text-sm text-slate-600">Visible</span>
                    <Switch
                      checked={category.visible}
                      onCheckedChange={() => toggleVisibility(category.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className={cn("h-4 w-4", category.featured ? "text-amber-400" : "text-slate-300")} />
                    <span className="text-sm text-slate-600">Featured</span>
                    <Switch
                      checked={category.featured}
                      onCheckedChange={() => toggleFeatured(category.id)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
