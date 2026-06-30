/**
 * Quote Recommendation Engine
 * Facet-based filtering — matches the HTML product finder test logic.
 * All product data sourced from allProductsData.json.
 * Decoration service pricing is separate (no per-product markup).
 */

import allProducts from "@/data/allProductsData.json"

// ─── Raw product shape ────────────────────────────────────────────
export interface RawProduct {
  id: string
  category: string
  code: string
  name: string
  brand: string
  tier: string
  price: number
  priceBreaks: Array<{ qty: number; price: number }>
  nextDay: boolean
  availableWith: string[]
  availablePositions: string[]
  gender?: string
  fit?: string
  fabric?: { type?: string; weight?: string; finish?: string | null } | string
  purpose?: string[]
  sector?: string
  featureText?: string
  colours?: string[]
  sizes?: string[]
  supportsPrint: boolean
  supportsEmbroidery: boolean
  image_url?: string
  url?: string
}

// ─── Engine inputs ────────────────────────────────────────────────
export interface QuoteInput {
  speed?: string           // "Within 2 days" | "Within 5 days" | "Not urgent"
  purpose?: string         // maps to PURPOSE_MAP
  category?: string        // "t-shirts" | "polo-shirts" | "hoodies" | "jackets"
  gender?: string          // "Mens" | "Womens" | "Kids" | "Unisex"
  fabric?: string          // "Cotton" | "Polyester" | "Poly-cotton"
  weight?: string          // "Lightweight" | "Mediumweight" | "Heavyweight"
  fit?: string             // "Regular" | "Slim"
  colour?: string          // colour name from product feed
  qty: number
  decorationType?: "Printing" | "Embroidery"
  priority?: "Lowest price" | "Balanced" | "Best quality"
}

// ─── Per-product quote result ─────────────────────────────────────
export interface ProductQuoteResult {
  product: RawProduct
  unitPrice: number           // product unit price from priceBreaks at chosen qty
  totalProductPrice: number   // unitPrice × qty
  decorationCostPerUnit: number
  decorationCostTotal: number
  totalPrice: number          // totalProductPrice + decorationCostTotal
  relevanceScore: number
}

// ─── One UI tier bucket ───────────────────────────────────────────
export interface TierBucket {
  tierId: string
  tierName: string
  color: string
  badge: string
  products: ProductQuoteResult[]
  unitPrice: number            // representative cheapest product's unitPrice
  decorationCostPerUnit: number
  totalPrice: number           // representative cheapest product's totalPrice
  delivery: string
}

// ─── Pricing helpers ──────────────────────────────────────────────

/** Get the applicable unit price for a given quantity from priceBreaks. */
export function getUnitPrice(priceBreaks: Array<{ qty: number; price: number }>, qty: number): number {
  const sorted = [...priceBreaks].sort((a, b) => b.qty - a.qty)
  for (const pb of sorted) {
    if (qty >= pb.qty) return pb.price
  }
  return priceBreaks[0]?.price ?? 0
}

// Service pricing (hardcoded from spreadsheet Services rows)
const SERVICE_PRICE_BREAKS: Record<string, Array<{ qty: number; price: number }>> = {
  printing:   [{ qty: 1, price: 5.99 }, { qty: 10, price: 4.75 }, { qty: 35, price: 3.50 }, { qty: 100, price: 2.99 }, { qty: 250, price: 2.25 }, { qty: 500, price: 2.25 }],
  embroidery: [{ qty: 1, price: 6.99 }, { qty: 10, price: 5.49 }, { qty: 35, price: 4.25 }, { qty: 100, price: 3.75 }, { qty: 250, price: 2.75 }, { qty: 500, price: 2.75 }],
}

function getServiceUnitPrice(service: "printing" | "embroidery", qty: number): number {
  return getUnitPrice(SERVICE_PRICE_BREAKS[service], qty)
}

// ─── Fabric bucket helper (matches HTML) ──────────────────────────
function fabBucket(fabric?: string): string {
  if (!fabric) return ""
  if (fabric.includes("Poly/Cotton")) return "Poly-cotton"
  if (fabric.includes("Polyester")) return "Polyester"
  if (fabric.includes("Cotton")) return "Cotton"
  return fabric
}

// ─── Facet matching (matches HTML logic) ──────────────────────────
const PURPOSE_MAP_INTERNAL: Record<string, { tags: string[]; sector?: string[] }> = {
  "Company Uniforms":      { tags: ["Uniform","Workwear","Hospitality","Security","Healthcare"] },
  "Sports & Teamwear":     { tags: ["Teamwear","Sportswear","Golf","Tennis"] },
  "Events & Promotions":   { tags: ["Promotions","Tradeshows","Stag Do","Hen Do"] },
  "Charity & Fundraising": { tags: ["Charities"] },
  "School & Education":    { tags: ["Schoolwear","Leavers Hoodies"], sector: ["Education"] },
  "Retail & Merchandise":  { tags: ["Merchandise","Fashion","Gifts"] },
}

function matchesPurpose(p: RawProduct, purposeKey: string): boolean {
  const m = PURPOSE_MAP_INTERNAL[purposeKey]
  if (!m) return true
  const productPurposes = p.purpose ?? []
  const productSector = p.sector ?? ""
  const tagsMatch = productPurposes.some((t: string) => m.tags.includes(t))
  const sectorMatch = m.sector?.length
    ? (Array.isArray(productSector) ? productSector : [productSector]).some((s: string) => m.sector!.includes(s))
    : false
  return tagsMatch || sectorMatch
}

function matchesGender(p: RawProduct, gender: string): boolean {
  const pg = p.gender ?? ""
  if (gender === "Kids") return pg === "Kids"
  return pg === gender || pg === "Unisex"
}

function matchesFabric(p: RawProduct, fabric: string): boolean {
  const ft = typeof p.fabric === "object" ? (p.fabric as { type?: string })?.type ?? "" : (p.fabric ?? "")
  return fabBucket(ft) === fabric
}

function matchesWeight(p: RawProduct, weight: string): boolean {
  const w = typeof p.fabric === "object" ? (p.fabric as { weight?: string })?.weight ?? "" : ""
  return w === weight
}

function matchesSpeed(p: RawProduct, speed: string): boolean {
  if (speed === "Next day") return p.nextDay === true
  return true // other speed options don't filter
}

function matchesColour(p: RawProduct, colour: string): boolean {
  return (p.colours ?? []).some(c => c.toLowerCase() === colour.toLowerCase())
}

// ─── Main: count available products for a set of filters ──────────
/** Check if a product passes all active facet filters (ignoring one facet). */
export function productPassesFilters(
  p: RawProduct,
  filters: QuoteInput,
  ignoreKey?: string
): boolean {
  for (const [key, value] of Object.entries(filters)) {
    if (key === ignoreKey || key === "qty" || key === "priority" || key === "decorationType") continue
    if (value == null) continue
    switch (key) {
      case "speed":
        if (!matchesSpeed(p, value as string)) return false
        break
      case "purpose":
        if (!matchesPurpose(p, value as string)) return false
        break
      case "category":
        if (p.category !== value) return false
        break
      case "gender":
        if (!matchesGender(p, value as string)) return false
        break
      case "fabric":
        if (!matchesFabric(p, value as string)) return false
        break
      case "weight":
        if (!matchesWeight(p, value as string)) return false
        break
      case "fit":
        if ((p.fit ?? "") !== value) return false
        break
      case "colour":
        if (!matchesColour(p, value as string)) return false
        break
    }
  }
  return true
}

/** Count how many products match given filters (optionally ignoring one key). */
export function countMatchingProducts(filters: QuoteInput, ignoreKey?: string): number {
  const products = allProducts as unknown as RawProduct[]
  return products.filter(p => productPassesFilters(p, filters, ignoreKey)).length
}

/** Check if a specific filter option would return any products. */
export function optionAvailable(filters: QuoteInput, key: string, optionValue: string): boolean {
  const testFilters = { ...filters, [key]: optionValue }
  return countMatchingProducts(testFilters) > 0
}

// ─── Main engine ──────────────────────────────────────────────────
export function runQuoteEngine(input: QuoteInput): TierBucket[] {
  const products = allProducts as unknown as RawProduct[]

  // 1. Apply all facet filters
  const filtered = products.filter(p => productPassesFilters(p, input))

  // 2. Further filter by decoration type if specified
  const withDeco = input.decorationType
    ? filtered.filter(p => {
        const decorKey = input.decorationType === "Printing" ? "supportsPrint" : "supportsEmbroidery"
        return p[decorKey] === true
      })
    : filtered

  // 3. Compute pricing
  const qty = input.qty || 1
  const decoService = input.decorationType === "Embroidery" ? "embroidery" : "printing"
  const decoUnitPrice = input.decorationType ? getServiceUnitPrice(decoService, qty) : 0

  const priced: ProductQuoteResult[] = withDeco.map(p => {
    const unitPrice = getUnitPrice(p.priceBreaks, qty)
    const totalProductPrice = parseFloat((unitPrice * qty).toFixed(2))
    const decorationCostTotal = parseFloat((decoUnitPrice * qty).toFixed(2))
    const totalPrice = parseFloat((totalProductPrice + decorationCostTotal).toFixed(2))

    return {
      product: p,
      unitPrice,
      totalProductPrice,
      decorationCostPerUnit: decoUnitPrice,
      decorationCostTotal,
      totalPrice,
      relevanceScore: 0, // computed below
    }
  })

  // 4. Sort by priority
  if (input.priority === "Lowest price") {
    priced.sort((a, b) => a.totalPrice - b.totalPrice)
  } else if (input.priority === "Best quality") {
    const TIER_RANK: Record<string, number> = { Budget: 1, Everyday: 2, Premium: 3, Retail: 4 }
    priced.sort((a, b) => {
      const ta = TIER_RANK[a.product.tier] ?? 0
      const tb = TIER_RANK[b.product.tier] ?? 0
      if (tb !== ta) return tb - ta // higher tier first
      return a.totalPrice - b.totalPrice // cheaper first within tier
    })
  } else {
    // Balanced: top tier first, then best value
    const TIER_RANK: Record<string, number> = { Budget: 1, Everyday: 2, Premium: 3, Retail: 4 }
    priced.sort((a, b) => {
      const ta = TIER_RANK[a.product.tier] ?? 0
      const tb = TIER_RANK[b.product.tier] ?? 0
      if (tb !== ta) return tb - ta
      return a.totalPrice - b.totalPrice
    })
  }

  // 5. Assign relevance scores based on sorted position
  priced.forEach((r, i) => { r.relevanceScore = priced.length - i })

  // 6. Group into UI tier buckets
  const TIER_RANK: Record<string, number> = { Budget: 1, Everyday: 2, Premium: 3, Retail: 4 }
  const uiTiers = [
    { tierId: "budget",   tierName: "Budget",   color: "#64748b", badge: "",        productTiers: ["Budget"] },
    { tierId: "everyday", tierName: "Everyday", color: "#4A90E2", badge: "POPULAR", productTiers: ["Everyday"] },
    { tierId: "premium",  tierName: "Premium",  color: "#7c3aed", badge: "",        productTiers: ["Premium"] },
    { tierId: "retail",   tierName: "Retail",   color: "#d97706", badge: "",        productTiers: ["Retail"] },
  ]

  const speedFilter = input.speed || ""
  const isUrgent = speedFilter === "Within 2 days"

  const buckets: TierBucket[] = uiTiers.map(uiTier => {
    let tierProducts = priced.filter(r => uiTier.productTiers.includes(r.product.tier))

    // Keep top 10 products per tier
    tierProducts = tierProducts.slice(0, 10)
    if (tierProducts.length === 0) return null

    // Representative = cheapest in this tier
    const rep = [...tierProducts].sort((a, b) => a.totalPrice - b.totalPrice)[0]

    // Delivery label
    const hasNextDay = tierProducts.some(r => r.product.nextDay)
    const delivery = isUrgent && hasNextDay
      ? "Next day available"
      : ["Budget", "Everyday"].includes(rep.product.tier)
        ? "3–7 days"
        : "2–5 days"

    return {
      tierId: uiTier.tierId,
      tierName: uiTier.tierName,
      color: uiTier.color,
      badge: uiTier.badge,
      products: tierProducts,
      unitPrice: rep.unitPrice,
      decorationCostPerUnit: rep.decorationCostPerUnit,
      totalPrice: rep.totalPrice,
      delivery,
    } satisfies TierBucket
  }).filter(Boolean) as TierBucket[]

  return buckets
}

// ─── Category helpers ─────────────────────────────────────────────
export function getCategories(): Array<{ id: string; label: string; desc: string }> {
  const map: Record<string, { label: string; desc: string }> = {
    "t-shirts":   { label: "T-Shirts",    desc: "Classic & performance" },
    "polo-shirts":{ label: "Polo Shirts", desc: "Smart casual" },
    "hoodies":    { label: "Hoodies",     desc: "Cosy & premium" },
    "jackets":    { label: "Jackets",     desc: "Outerwear & fleece" },
  }
  const products = allProducts as unknown as RawProduct[]
  const cats = [...new Set(products.map(p => p.category))]
  return cats.map(c => ({ id: c, ...map[c] ?? { label: c, desc: "" } }))
}

export function getProductsForCategory(category: string): RawProduct[] {
  const products = allProducts as unknown as RawProduct[]
  return products.filter(p => p.category === category)
}

/** Get all unique colour options available across products matching given filters (optionally ignoring one key). */
export function getAvailableColours(filters: QuoteInput, ignoreKey?: string): Array<{ id: string; label: string; count: number }> {
  const products = allProducts as unknown as RawProduct[]
  const matching = products.filter(p => productPassesFilters(p, filters, ignoreKey))
  const colourCounts = new Map<string, number>()
  matching.forEach(p => {
    (p.colours ?? []).forEach(c => {
      colourCounts.set(c, (colourCounts.get(c) ?? 0) + 1)
    })
  })
  const order = ["White","Black","Navy","Blue","Red","Green","Grey","Yellow","Purple","Orange","Pink","Brown","Cream","Multi"]
  return [...colourCounts.entries()]
    .map(([id, count]) => ({ id, label: id, count }))
    .sort((a, b) => {
      const ai = order.indexOf(a.id)
      const bi = order.indexOf(b.id)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
}
