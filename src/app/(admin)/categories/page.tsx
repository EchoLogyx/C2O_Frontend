import { categoryRepository } from "@/lib/repositories/category-repository"
import { CategoriesClient } from "@/components/categories/categories-client"

export default async function CategoriesPage() {
  const categories = await categoryRepository.getAll()
  return <CategoriesClient initialCategories={categories} />
}
