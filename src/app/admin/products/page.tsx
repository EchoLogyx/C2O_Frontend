import { productRepository } from "@/lib/repositories/product-repository"
import { ProductsClient } from "@/components/products/products-client"

export default async function ProductsPage() {
  const products = await productRepository.getAll()
  return <ProductsClient initialProducts={products} />
}
