/**
 * Quote Recommendation Engine
 * Data-driven — all product data sourced from allProductsData.json
 * Decoration pricing read from per-product fields so it can be swapped
 * for live supplier pricing without touching recommendation logic.
 */

import allProducts from "@/data/allProductsData.json"

// ─── Raw product shape (matches allProductsData.json) ────────────
export interface RawProduct {
  id: string
  category: string        // "t-shirts" | "hoodies" | "polo-shirts" | "jackets"
  code: string
  name: string
  brand: string
  tier: string            // "Budget" | "Everyday" | "Premium" | "Retail"
  price: number
  priceBreaks: Array<{ qty: number; price: number }>
  nextDay: boolean
  availableWith: string[] // "Printing" | "Embroidery"
  availablePositions: string[]
  fabric?: { type?: string; weight?: string; finish?: string | null } | string
  feature?: string
  supportsPrint: boolean
  supportsEmbroidery: boolean
  printMarkupPercent: number
  embroideryMarkupPercent: number
  printSetupFee: number
  embroiderySetupFee: number
}

// ─── Engine inputs ────────────────────────────────────────────────
export interface QuoteInput {
  purpose: string
  qty: number
  priority: "Speed" | "Balance" | "Quality"
  category: string          // e.g. "t-shirts"
  decorationType: "Printing" | "Embroidery"
  logoPosition: string      // e.g. "5. Left Chest"
  logoStatus: string
  deadline: string
}

// ─── Per-product quote result ─────────────────────────────────────
export interface ProductQuoteResult {
  product: RawProduct
  unitBasePrice: number       // from priceBreaks for chosen qty
  decorationMarkup: number    // percentage applied
  unitDecoratedPrice: number  // unitBasePrice * (1 + markup/100)
  setupFee: number
  totalOrderPrice: number     // unitDecoratedPrice * qty + setupFee
  deliverySuitable: boolean   // nextDay flag when deadline = "asap"
  relevanceScore: number
}

// ─── One UI tier bucket ───────────────────────────────────────────
export interface TierBucket {
  tierId: string              // "budget" | "everyday" | "premium" | "retail" | "designer"
  tierName: string
  emoji: string
  color: string
  badge: string
  products: ProductQuoteResult[]
  // representative pricing (cheapest product in tier)
  unitPrice: number
  setupFee: number
  totalPrice: number
  delivery: string
}

// ─── UI tier mapping ──────────────────────────────────────────────
const UI_TIERS: Array<{
  tierId: string; tierName: string; emoji: string; color: string; badge: string
  productTiers: string[]                // which product.tier values map here
  deliveryLabel: string
}> = [
  { tierId: "budget",   tierName: "Budget",   emoji: "🌱", color: "#64748b", badge: "",        productTiers: ["Budget"],            deliveryLabel: "5–7 days" },
  { tierId: "everyday", tierName: "Everyday", emoji: "⭐", color: "#4A90E2", badge: "POPULAR", productTiers: ["Everyday"],          deliveryLabel: "3–5 days" },
  { tierId: "premium",  tierName: "Premium",  emoji: "💫", color: "#7c3aed", badge: "",        productTiers: ["Premium"],           deliveryLabel: "3–4 days" },
  { tierId: "retail",   tierName: "Retail",   emoji: "🏆", color: "#d97706", badge: "",        productTiers: ["Retail"],            deliveryLabel: "2–3 days" },
  { tierId: "designer", tierName: "Designer", emoji: "✨", color: "#dc2626", badge: "LUXURY",  productTiers: ["Retail", "Premium"], deliveryLabel: "5–7 days" },
]

// ─── Helpers ──────────────────────────────────────────────────────

/** Return the applicable unit price for a given quantity. */
export function getUnitPrice(priceBreaks: Array<{ qty: number; price: number }>, qty: number): number {
  const sorted = [...priceBreaks].sort((a, b) => b.qty - a.qty)
  for (const pb of sorted) {
    if (qty >= pb.qty) return pb.price
  }
  return priceBreaks[0]?.price ?? 0
}

/** Compute a relevance score for priority sorting. */
function score(product: RawProduct, input: QuoteInput): number {
  let s = 0
  if (input.priority === "Speed") {
    if (product.nextDay) s += 30
    if (["Budget", "Everyday"].includes(product.tier)) s += 10
  } else if (input.priority === "Balance") {
    if (["Everyday", "Premium"].includes(product.tier)) s += 20
  } else {
    if (["Premium", "Retail"].includes(product.tier)) s += 20
  }
  // prefer products with matching position
  if (product.availablePositions.includes(input.logoPosition)) s += 15
  return s
}

// ─── Main engine function ─────────────────────────────────────────
export function runQuoteEngine(input: QuoteInput): TierBucket[] {
  const products = allProducts as unknown as RawProduct[]

  // 1. Filter by category
  let filtered = products.filter(p =>
    p.category.toLowerCase() === input.category.toLowerCase()
  )

  // 2. Filter by decoration type
  const decorKey = input.decorationType === "Printing" ? "supportsPrint" : "supportsEmbroidery"
  filtered = filtered.filter(p => p[decorKey] === true)

  // 3. Filter by logo position (if product has defined positions)
  filtered = filtered.filter(p =>
    p.availablePositions.length === 0 ||
    p.availablePositions.includes(input.logoPosition)
  )

  // 4–6. Compute pricing per product
  const priced: ProductQuoteResult[] = filtered.map(p => {
    const unitBasePrice  = getUnitPrice(p.priceBreaks, input.qty)
    const markupPct      = input.decorationType === "Printing"
      ? p.printMarkupPercent
      : p.embroideryMarkupPercent
    const setupFee       = input.decorationType === "Printing"
      ? p.printSetupFee
      : p.embroiderySetupFee
    const unitDecoratedPrice = parseFloat((unitBasePrice * (1 + markupPct / 100)).toFixed(2))
    const totalOrderPrice    = parseFloat((unitDecoratedPrice * input.qty + setupFee).toFixed(2))
    const deliverySuitable   = input.deadline === "asap" ? p.nextDay : true
    return {
      product: p,
      unitBasePrice,
      decorationMarkup: markupPct,
      unitDecoratedPrice,
      setupFee,
      totalOrderPrice,
      deliverySuitable,
      relevanceScore: score(p, input),
    }
  })

  // 7. Sort by relevance score descending
  priced.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // 8–9. Group into UI tier buckets (up to 10 products each)
  const buckets: TierBucket[] = UI_TIERS.map(uiTier => {
    let tierProducts = priced.filter(r =>
      uiTier.productTiers.includes(r.product.tier)
    )

    // Designer tier = top 10 most expensive Premium+Retail
    if (uiTier.tierId === "designer") {
      tierProducts = [...tierProducts]
        .sort((a, b) => b.unitBasePrice - a.unitBasePrice)
        .slice(0, 10)
    } else {
      tierProducts = tierProducts.slice(0, 10)
    }

    if (tierProducts.length === 0) {
      return null
    }

    // Representative = cheapest total in this tier
    const rep = [...tierProducts].sort((a, b) => a.totalOrderPrice - b.totalOrderPrice)[0]

    // Delivery label
    const asap = input.deadline === "asap"
    const hasNextDay = tierProducts.some(r => r.product.nextDay)
    const delivery = asap && hasNextDay
      ? "Next day available"
      : uiTier.deliveryLabel

    return {
      tierId:    uiTier.tierId,
      tierName:  uiTier.tierName,
      emoji:     uiTier.emoji,
      color:     uiTier.color,
      badge:     uiTier.badge,
      products:  tierProducts,
      unitPrice: rep.unitDecoratedPrice,
      setupFee:  rep.setupFee,
      totalPrice: rep.totalOrderPrice,
      delivery,
    } satisfies TierBucket
  }).filter(Boolean) as TierBucket[]

  return buckets
}

// ─── Category helpers for the UI ─────────────────────────────────
export function getCategories(): Array<{ id: string; label: string; emoji: string; desc: string }> {
  const map: Record<string, { label: string; emoji: string; desc: string }> = {
    "t-shirts":   { label: "T-Shirts",    emoji: "👕", desc: "Classic & performance" },
    "polo-shirts":{ label: "Polo Shirts", emoji: "🎽", desc: "Smart casual" },
    "hoodies":    { label: "Hoodies",     emoji: "🧥", desc: "Cosy & premium" },
    "jackets":    { label: "Jackets",     emoji: "🧣", desc: "Outerwear & fleece" },
  }
  const products = allProducts as unknown as RawProduct[]
  const cats = [...new Set(products.map(p => p.category))]
  return cats.map(c => ({ id: c, ...map[c] ?? { label: c, emoji: "👔", desc: "" } }))
}

export function getProductsForCategory(category: string): RawProduct[] {
  const products = allProducts as unknown as RawProduct[]
  return products.filter(p => p.category === category)
}
