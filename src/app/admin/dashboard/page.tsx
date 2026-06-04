import { productRepository } from "@/lib/repositories/product-repository"
import { categoryRepository } from "@/lib/repositories/category-repository"
import { quoteRepository } from "@/lib/repositories/quote-repository"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const [products, categories, quotes] = await Promise.all([
    productRepository.getAll(),
    categoryRepository.getAll(),
    quoteRepository.getAll(),
  ])

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.active).length,
    totalCategories: categories.length,
    featuredCategories: categories.filter((c) => c.featured).length,
    totalQuotes: quotes.length,
    newQuotes: quotes.filter((q) => q.status === "New").length,
    wonQuotes: quotes.filter((q) => q.status === "Won").length,
  }

  return <DashboardClient stats={stats} recentQuotes={quotes.slice(0, 5)} categories={categories} />
}
