import { tierRepository } from "@/lib/repositories/tier-repository"
import { productRepository } from "@/lib/repositories/product-repository"
import { TiersClient } from "@/components/tiers/tiers-client"

export default async function TiersPage() {
  const [tiers, products] = await Promise.all([
    tierRepository.getAll(),
    productRepository.getAll(),
  ])
  return <TiersClient initialTiers={tiers} allProducts={products} />
}
