"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  FileText, MessageSquare, Headphones, Sparkles, Send, ArrowLeft, X,
  RefreshCw, Info, Phone, Mail, ShoppingCart,
} from "lucide-react"
import {
  NAVY, NAVY_DARK, NAVY_LIGHT, GOLD, INK, MUTED, BORDER, GREY_BG,
  GREEN, AMBER, USE_CASES, DECORATION_TYPES,
  SPEED_OPTIONS, GENDER_OPTIONS, FABRIC_OPTIONS, WEIGHT_OPTIONS, FIT_OPTIONS,
  FAQ_CHIPS, ADVICE_CHIPS, SERVICE_PRICING, PURPOSE_MAP,
  LOGO_POSITIONS, LOGO_STATUS,
} from "./data"
import type { ViewMode, Message, QuoteAnswers, ProductInfo } from "./types"
import { runQuoteEngine, getCategories, getProductsForCategory, countMatchingProducts, optionAvailable } from "@/lib/quoteEngine"
import type { TierBucket, QuoteInput, ProductQuoteResult } from "@/lib/quoteEngine"

// ─── Morgan Avatar ─────────────────────────────────────────────────

// Extend Window for elxBot chatbot API
declare global {
  interface Window {
    elxBot?: {
      createConversation: (opts: {
        sessionId?: string
        onEvent: (event: unknown) => void
      }) => { send: (msg: string) => void; disconnect: () => void }
    }
  }
}

// ─── Session cookie helpers (browser-session-scoped, no expiry) ──
function getSessionId(): string | undefined {
  if (typeof document === "undefined") return undefined
  const m = document.cookie.match(/(?:^|;\s*)c2o_session_id=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : undefined
}
function setSessionId(id: string) {
  if (typeof document === "undefined") return
  document.cookie = `c2o_session_id=${encodeURIComponent(id)}; path=/; SameSite=Lax`
}
function clearSessionId() {
  if (typeof document === "undefined") return
  document.cookie = "c2o_session_id=; path=/; SameSite=Lax; max-age=0"
}
function MorganAvatar({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, flexShrink: 0,
      boxShadow: "0 2px 8px rgba(74,144,226,0.35)",
    }}>🤖</div>
  )
}

// ─── Bubble ────────────────────────────────────────────────────────
function Bubble({ role, text, senderIcon }: { role: Message["role"]; text: string; senderIcon?: string }) {
  const isUser = role === "user"
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && (
        <div style={{ marginRight: 8, marginTop: 2, flexShrink: 0 }}>
          {senderIcon ? (
            <img src={senderIcon} alt="avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", background: GREY_BG }} />
          ) : (
            <MorganAvatar size={28} />
          )}
        </div>
      )}
      <div style={{
        maxWidth: "75%", padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        background: isUser ? NAVY : "#fff", color: isUser ? "#fff" : INK,
        fontSize: 14, lineHeight: 1.55,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: isUser ? "none" : `1px solid ${BORDER}`,
      }}>{text}</div>
    </div>
  )
}

// ─── Pill button ───────────────────────────────────────────────────
function QuickReply({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 20,
      border: `1.5px solid ${BORDER}`, background: "#fff", color: INK,
      fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
    }}>{label}</button>
  )
}

// ─── Product Card ──────────────────────────────────────────────────
function ProductCard({ product }: { product: ProductInfo }) {
  const tagList = product.tags ? product.tags.split(",").map(t => t.trim()).filter(Boolean) : []
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`,
      overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {product.image_url && (
        <img src={product.image_url} alt={product.name}
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block", background: GREY_BG }} />
      )}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
          {product.category} · {product.sku}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: INK, fontFamily: "'Quicksand', Lato, sans-serif", marginBottom: 4 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>£{product.price.toFixed(2)}</span>
            <span style={{ fontSize: 12, color: MUTED }}> /unit</span>
          </div>
          <a href={product.url || "#"} target="_blank" rel="noopener" style={{
            padding: "7px 14px", borderRadius: 8, background: NAVY, color: "#fff",
            fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "inherit",
          }}>
            View →
          </a>
        </div>
        {tagList.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
            {tagList.slice(0, 4).map(t => (
              <span key={t} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 4,
                background: GREY_BG, color: MUTED, fontWeight: 500,
              }}>{t}</span>
            ))}
            {tagList.length > 4 && (
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, color: MUTED }}>
                +{tagList.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Widget ────────────────────────────────────────────────────────
export function ExpressQuoteWidget() {
  const [view, setView] = useState<ViewMode>("home")
  const [messages, setMessages] = useState<Message[]>([])
  const [answers, setAnswers] = useState<QuoteAnswers>({ qty: 25 })
  const [step, setStep] = useState(0)
  const [textInput, setTextInput] = useState("")
  const [tierBuckets, setTierBuckets] = useState<TierBucket[]>([])
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductQuoteResult | null>(null)
  const [actionView, setActionView] = useState<"" | "email" | "callback" | "order">("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, step, tierBuckets])

  // Look up the applicable unit price for a decoration type at a given qty
  function decoUnitPrice(decoType: "printing" | "embroidery", qty: number): number {
    const breaks = SERVICE_PRICING[decoType]
    let price = breaks[breaks.length - 1].price
    for (const b of breaks) {
      if (qty >= b.qty) price = b.price
    }
    return price
  }

  const push = useCallback((role: Message["role"], text: string, products?: ProductInfo[], senderIcon?: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, ...(products ? { products } : {}), ...(senderIcon ? { senderIcon } : {}) }])
  }, [])

  // ─── Quote steps (cascading facet filters) ────────────────────
  const quoteSteps = [
    { key: "speed",   question: "When do you need this?" },
    { key: "purpose", question: "What's the main purpose of this order?" },
    { key: "category", question: "What type of garment?" },
    { key: "gender",  question: "Who's it for?" },
    { key: "fabric",  question: "What fabric do you prefer?" },
    { key: "weight",  question: "What fabric weight?" },
    { key: "fit",     question: "What fit?" },
    { key: "qty",     question: "How many items do you need?" },
    { key: "decorationType", question: "Any decoration needed?" },
    { key: "logoPosition", question: "Where would you like the logo?" },
    { key: "logoStatus", question: "Is this a new logo, or one we already have on file?" },
  ]

  async function startCapability(v: ViewMode) {
    setView(v); setMessages([]); setStep(0)
    setAnswers({ qty: 25 }); setSelectedTier(null); setSelectedProduct(null)
    setActionView(""); setTextInput(""); setTierBuckets([])
    if (v === "quote") push("morgan", "Great! Let's find the right products for you. I'll ask a few quick questions.")
    if (v === "faq") push("morgan", "Hi! Pick a topic or type your own question below.")
    if (v === "advice") push("morgan", "I'll help you find the perfect product. Pick a scenario or describe what you need.")
    if (v === "chat") push("morgan", "Connecting you to our team… You're through to Sarah 👋 How can I help?")
    if (v === "faq" || v === "advice" || v === "chat") {
      await ensureConversation()
    }
  }

  function handleQuoteAnswer(key: string, value: string | number, displayLabel?: string) {
    const label = displayLabel ?? (typeof value === "number" ? `${value} items` : String(value))
    push("user", label)
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    const nextStep = step + 1
    setTimeout(() => {
      if (nextStep < quoteSteps.length) {
        push("morgan", quoteSteps[nextStep].question)
        setStep(nextStep)
      } else {
        // All questions done — run engine
        push("morgan", "Calculating results from our product catalogue…")
        setTimeout(() => {
          const decoTypeVal = updated.decorationType === "None" ? undefined : updated.decorationType
          const input = {
            speed: updated.speed,
            purpose: updated.purpose,
            category: updated.category,
            gender: updated.gender,
            fabric: updated.fabric,
            weight: updated.weight,
            fit: updated.fit,
            qty: updated.qty ?? 25,
            decorationType: decoTypeVal as "Printing" | "Embroidery" | undefined,
            priority: "Balanced" as const,
          }
          const buckets = runQuoteEngine(input)
          setTierBuckets(buckets); setSelectedProduct(null)

          const hasDeco = input.decorationType ? ` with ${input.decorationType}` : ""
          push("morgan", `Here are your results for ${input.category || "all garments"}${hasDeco}. We found ${buckets.reduce((s, b) => s + b.products.length, 0)} matching products across ${buckets.length} tiers.`)
          setStep(nextStep)
        }, 400)
      }
    }, 300)
  }

  function goBack() {
    if (view === "quote" && step > 0 && step < quoteSteps.length) {
      setStep(s => s - 1)
      setMessages(m => m.slice(0, -2))
      if (step >= quoteSteps.length) { setTierBuckets([]); setSelectedTier(null); setSelectedProduct(null) }
    } else {
      setView("home")
    }
  }

  // ─── Step renderers ─────────────────────────────────────────────
  function renderStep() {
    const current = quoteSteps[step]
    if (!current) return null

    // Build current filters so far (excluding current step) to check option availability
    const decoSafe = answers.decorationType === "None" ? undefined : answers.decorationType
    const currentFilters: QuoteInput = {
      ...answers as Omit<QuoteAnswers, "decorationType">,
      decorationType: decoSafe,
      qty: answers.qty ?? 25,
    }

    switch (current.key) {
      case "speed":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SPEED_OPTIONS.map(s => {
              const avail = optionAvailable(currentFilters, "speed", s.id)
              return (
                <button key={s.id} onClick={() => avail && handleQuoteAnswer("speed", s.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {s.label}
                </button>
              )
            })}
          </div>
        )

      case "purpose":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {USE_CASES.map(u => {
              const avail = optionAvailable(currentFilters, "purpose", u.id)
              return (
                <button key={u.id} onClick={() => avail && handleQuoteAnswer("purpose", u.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {u.label}
                </button>
              )
            })}
          </div>
        )

      case "category": {
        const cats = getCategories()
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cats.map(c => {
              const avail = optionAvailable(currentFilters, "category", c.id)
              return (
                <button key={c.id} onClick={() => avail && handleQuoteAnswer("category", c.id, c.label)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {c.label}
                </button>
              )
            })}
          </div>
        )
      }

      case "gender":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {GENDER_OPTIONS.map(g => {
              const avail = optionAvailable(currentFilters, "gender", g.id)
              return (
                <button key={g.id} onClick={() => avail && handleQuoteAnswer("gender", g.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {g.label}
                </button>
              )
            })}
          </div>
        )

      case "fabric":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FABRIC_OPTIONS.map(f => {
              const avail = optionAvailable(currentFilters, "fabric", f.id)
              return (
                <button key={f.id} onClick={() => avail && handleQuoteAnswer("fabric", f.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {f.label}
                </button>
              )
            })}
          </div>
        )

      case "weight":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WEIGHT_OPTIONS.map(w => {
              const avail = optionAvailable(currentFilters, "weight", w.id)
              return (
                <button key={w.id} onClick={() => avail && handleQuoteAnswer("weight", w.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {w.label}
                </button>
              )
            })}
          </div>
        )

      case "fit":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {FIT_OPTIONS.map(f => {
              const avail = optionAvailable(currentFilters, "fit", f.id)
              return (
                <button key={f.id} onClick={() => avail && handleQuoteAnswer("fit", f.id)}
                  disabled={!avail}
                  style={{
                    padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`,
                    background: "#fff", color: INK,
                    cursor: avail ? "pointer" : "not-allowed",
                    fontSize: 13, fontWeight: 500, fontFamily: "inherit", opacity: avail ? 1 : 0.4,
                  }}>
                  {f.label}
                </button>
              )
            })}
          </div>
        )

      case "qty":
        const quickQtys = [1, 5, 10, 25, 50, 100, 250, 500]
        const currentQty = answers.qty ?? 10
        return (
          <div style={{ background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: 16, maxWidth: 380 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setAnswers(a => ({ ...a, qty: Math.max(1, (a.qty ?? 10) - 1) }))}
                style={{ width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                −
              </button>
              <input type="number" min={1} max={10000}
                value={currentQty}
                onChange={e => setAnswers(a => ({ ...a, qty: Math.max(1, Number(e.target.value) || 1) }))}
                style={{
                  width: 100, padding: "10px 12px", borderRadius: 8,
                  border: `1.5px solid ${BORDER}`, fontSize: 20, fontWeight: 700,
                  color: INK, textAlign: "center", fontFamily: "inherit", outline: "none",
                }} />
              <button onClick={() => setAnswers(a => ({ ...a, qty: Math.min(10000, (a.qty ?? 10) + 1) }))}
                style={{ width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                +
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 12 }}>
              {quickQtys.map(q => {
                const isActive = currentQty === q
                return (
                  <button key={q} onClick={() => setAnswers(a => ({ ...a, qty: q }))}
                    style={{
                      padding: "4px 10px", borderRadius: 14,
                      border: `1px solid ${isActive ? NAVY : BORDER}`,
                      background: isActive ? NAVY : "#fff",
                      color: isActive ? "#fff" : MUTED,
                      fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    }}>
                    {q}
                  </button>
                )
              })}
            </div>
            <button onClick={() => handleQuoteAnswer("qty", currentQty)}
              style={{ width: "100%", marginTop: 12, padding: "10px 16px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Continue with {currentQty} →
            </button>
          </div>
        )

      case "decorationType":
        const printPrice = decoUnitPrice("printing", answers.qty ?? 25)
        const embPrice = decoUnitPrice("embroidery", answers.qty ?? 25)
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button onClick={() => handleQuoteAnswer("decorationType", "Printing")}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
              {DECORATION_TYPES[0].label} — £{printPrice.toFixed(2)}/unit
            </button>
            <button onClick={() => handleQuoteAnswer("decorationType", "Embroidery")}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
              {DECORATION_TYPES[1].label} — £{embPrice.toFixed(2)}/unit
            </button>
            <button onClick={() => handleQuoteAnswer("decorationType", "None")}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
              None — Plain garments only
            </button>
          </div>
        )

      case "logoPosition":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LOGO_POSITIONS.map(lp => (
              <button key={lp.id} onClick={() => handleQuoteAnswer("logoPosition", lp.id, lp.label)}
                style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
                {lp.label}
              </button>
            ))}
          </div>
        )

      case "logoStatus":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LOGO_STATUS.map(ls => (
              <button key={ls.id} onClick={() => handleQuoteAnswer("logoStatus", ls.id, ls.label)}
                style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit" }}>
                {ls.label}
              </button>
            ))}
          </div>
        )

      default: return null
    }
  }

  // ─── Product results ──────────────────────────────────────────────
  function renderTierResults() {
    if (tierBuckets.length === 0) return (
      <div style={{ padding: 20, textAlign: "center", color: MUTED, fontSize: 14 }}>
        No products found matching your criteria. Try changing some options.
      </div>
    )

    // Flatten all products across all tiers
    const allProducts = tierBuckets.flatMap(t =>
      t.products.map(r => ({ ...r, tier: t }))
    )

    // ── Action overlay (email / callback / order) ────────────────
    if (actionView && selectedProduct) {
      const t = tierBuckets.find(b => b.products.some(p => p.product.id === selectedProduct.product.id))!
      const hasDeco = answers.decorationType && answers.decorationType !== "None"

      if (actionView === "email") return (
        <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>📧 Email your quote</div>
          <input placeholder="Your email address" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          <input placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: NAVY, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Send quote to my inbox</button>
          <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
        </div>
      )

      if (actionView === "callback") return (
        <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>📞 Request a callback</div>
          <input placeholder="Your phone number" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          <input placeholder="Best time to call" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: GREEN, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Request callback</button>
          <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
        </div>
      )

      if (actionView === "order") return (
        <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>🛒 Confirm order intent</div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>We'll contact you to finalise artwork, sizes and payment.</div>
          <div style={{ background: GREY_BG, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
            {[
              ["Tier", t.tierName],
              ["Product", selectedProduct.product.name],
              ["Qty", `${answers.qty} items`],
              ["Unit price (garment)", `£${selectedProduct.unitPrice.toFixed(2)}`],
              ...(hasDeco ? [["Decoration/unit", `£${selectedProduct.decorationCostPerUnit.toFixed(2)}`]] : []),
              ["Est. total", `£${selectedProduct.totalPrice.toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: MUTED }}>{l}</span>
                <strong style={l === "Est. total" ? { color: NAVY } : {}}>{v}</strong>
              </div>
            ))}
          </div>
          <input placeholder="Full name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          <input placeholder="Email" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: AMBER, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Confirm order intent</button>
          <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
        </div>
      )
    }

    // ── All products (grouped by tier) + detail panel at bottom ──
    const selTier = selectedProduct
      ? tierBuckets.find(b => b.products.some(p => p.product.id === selectedProduct.product.id))
      : null

    return (
      <div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
          {allProducts.length} product{allProducts.length !== 1 ? "s" : ""} found for <strong style={{ color: INK }}>{answers.qty} items</strong>
          {answers.decorationType && answers.decorationType !== "None"
            ? <> · <strong style={{ color: INK }}>{answers.decorationType}</strong></>
            : <> · <strong style={{ color: INK }}>Plain (no decoration)</strong></>
          }
          {answers.category ? <> · <strong style={{ color: INK }}>{answers.category}</strong></> : null}
        </div>

        {tierBuckets.map(t => (
          <div key={t.tierId} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t.tierName} Tier</span>
              {t.badge && <span style={{ fontSize: 10, fontWeight: 700, background: t.color, color: "#fff", padding: "2px 7px", borderRadius: 4 }}>{t.badge}</span>}
              <span style={{ fontSize: 12, color: MUTED }}>· {t.products.length} product{t.products.length !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {t.products.map(r => {
                const isSelected = selectedProduct?.product.id === r.product.id
                return (
                  <button key={r.product.id} onClick={() => { setSelectedProduct(isSelected ? null : r); setActionView("") }}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 10,
                      border: `1.5px solid ${isSelected ? t.color : BORDER}`,
                      background: isSelected ? `${t.color}10` : "#fff",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{r.product.name}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {r.product.brand} · £{r.unitPrice.toFixed(2)}/unit
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: t.color }}>£{r.totalPrice.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: MUTED }}>est. total</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── Product detail panel (when a product is selected) ── */}
        {selectedProduct && selTier && (
          <div style={{ background: "#fff", borderRadius: 12, border: `2px solid ${selTier.color}`, padding: 20, marginTop: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{selTier.tierName} Tier</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{selectedProduct.product.name}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: selTier.color }}>£{selectedProduct.totalPrice.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: MUTED }}>est. total for {answers.qty} items</div>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: answers.decorationType && answers.decorationType !== "None" ? "repeat(4,1fr)" : "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Unit (garment)", value: `£${selectedProduct.unitPrice.toFixed(2)}` },
                ...(answers.decorationType && answers.decorationType !== "None" ? [{ label: "Decoration/unit", value: `£${selectedProduct.decorationCostPerUnit.toFixed(2)}` }] : []),
                { label: "Delivery", value: selTier.delivery },
              ].map(row => (
                <div key={row.label} style={{ textAlign: "center", background: GREY_BG, borderRadius: 8, padding: "10px 6px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{row.value}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{row.label}</div>
                </div>
              ))}
            </div>

            {/* Product info */}
            {selectedProduct.product.featureText && (
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14, padding: "10px 12px", background: GREY_BG, borderRadius: 8 }}>
                {selectedProduct.product.featureText}
              </div>
            )}

            {/* Brand & specs */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 12, color: MUTED }}>
              <span><strong style={{ color: INK }}>Brand:</strong> {selectedProduct.product.brand}</span>
              {selectedProduct.product.colours && <span><strong style={{ color: INK }}>Colours:</strong> {selectedProduct.product.colours.join(", ")}</span>}
              {selectedProduct.product.sizes && <span><strong style={{ color: INK }}>Sizes:</strong> {selectedProduct.product.sizes.join(", ")}</span>}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setActionView("email")} style={{ flex: 1, minWidth: 110, padding: "10px 12px", borderRadius: 8, background: NAVY, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Mail size={14} /> Email quote
              </button>
              <button onClick={() => setActionView("callback")} style={{ flex: 1, minWidth: 110, padding: "10px 12px", borderRadius: 8, background: GREEN, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Phone size={14} /> Callback
              </button>
              <button onClick={() => setActionView("order")} style={{ flex: 1, minWidth: 110, padding: "10px 12px", borderRadius: 8, background: AMBER, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <ShoppingCart size={14} /> Order now
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Home screen ────────────────────────────────────────────────
  function renderHome() {
    const modes = [
      { v: "quote" as ViewMode, icon: <FileText size={18} />, label: "Get a quote", sub: "5 priced tiers in 2 min", color: NAVY },
      { v: "faq" as ViewMode, icon: <MessageSquare size={18} />, label: "Ask a question", sub: "Setup, delivery, minimums", color: "#7c3aed" },
      { v: "chat" as ViewMode, icon: <Headphones size={18} />, label: "Speak to a person", sub: "Live team — 9am to 5pm", color: GREEN },
      { v: "advice" as ViewMode, icon: <Sparkles size={18} />, label: "Help me choose", sub: "Product & decoration advice", color: AMBER },
    ]
    return (
      <div>
        <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
          <div style={{ marginBottom: 12 }}><MorganAvatar size={64} /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: INK, fontFamily: "'Quicksand', Lato, sans-serif" }}>Hi, I&apos;m Morgan</div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Your assistant at Clothes2Order. What can I help with today?</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          {modes.map(c => (
            <button key={c.v} onClick={() => startCapability(c.v)}
              style={{ padding: 16, borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK, fontFamily: "'Quicksand', Lato, sans-serif" }}>{c.label}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{c.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: 12, background: "#eff6ff", border: `1px solid ${NAVY_LIGHT}`, borderRadius: 10, fontSize: 12, color: "#1e40af", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Info size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <div><strong>Live data.</strong> Pricing is calculated in real time from our product catalogue using your quantity and decoration preferences.</div>
        </div>
      </div>
    )
  }

  const conversationRef = useRef<ReturnType<NonNullable<Window["elxBot"]>["createConversation"]> | null>(null)

  const showTextInput = view === "faq" || view === "chat" || view === "advice"

  // ─── Lazily create conversation (only when user needs chat) ──
  async function ensureConversation(): Promise<boolean> {
    if (conversationRef.current) return true

    if (typeof window === "undefined") return false
    if (!window.elxBot?.createConversation) {
      for (let i = 0; i < 50; i++) {
        await new Promise<void>(r => setTimeout(r, 200))
        if (window.elxBot?.createConversation) break
      }
      if (!window.elxBot?.createConversation) {
        console.error("[elxBot] script not loaded after waiting")
        return false
      }
    }

    // Pass existing session cookie if available, otherwise let backend create a new session
    const existingSessionId = getSessionId()

    const conv = window.elxBot.createConversation({
      ...(existingSessionId ? { sessionId: existingSessionId } : {}),
      onEvent(event) {
        const ev = event as Record<string, unknown> | undefined
        if (!ev?.type) return

        switch (ev.type) {
          case "session_info": {
            const payload = ev.payload as Record<string, unknown> | undefined
            const newId = payload?.sessionId as string | undefined
            if (newId) setSessionId(newId)
            break
          }

          case "history": {
            const items = Array.isArray(ev.payload) ? ev.payload : []
            if (items.length === 0) break // no history, keep local greeting

            const historyMessages: Message[] = []
            for (const item of items) {
              const m = item as Record<string, unknown>
              const userType = m.user_type as string | undefined
              const chatData = m.chat_data as Record<string, unknown> | undefined
              let text = ""
              let products: ProductInfo[] | undefined
              const isLeft = userType === "ai" || userType === "client"

              if (userType === "ai") {
                const aiResponse = chatData?.ai_response as Record<string, unknown> | undefined
                text = String(aiResponse?.ai_message ?? m.message ?? JSON.stringify(m))
                const rawProducts = aiResponse?.product_info as unknown[] | undefined
                if (rawProducts?.length) {
                  products = (rawProducts as Record<string, unknown>[]).map(p => ({
                    id: String(p.id ?? ""),
                    name: String(p.name ?? ""),
                    description: String(p.description ?? ""),
                    price: Number(p.price ?? 0),
                    sku: String(p.sku ?? ""),
                    image_url: String(p.image_url ?? ""),
                    category: String(p.category ?? ""),
                    tags: String(p.tags ?? ""),
                    currency: String(p.currency ?? "GBP"),
                    available: Boolean(p.available ?? true),
                    url: String(p.url ?? ""),
                  }))
                }
              } else {
                // user or client — text lives in chat_data.msg
                text = String(chatData?.msg ?? m.message ?? m.text ?? "")
              }

              historyMessages.push({
                id: `${Date.now()}-${Math.random()}`,
                role: isLeft ? "morgan" : "user",
                text: String(text),
                ...(isLeft && products ? { products } : {}),
                ...(userType === "client" && m.sender_icon ? { senderIcon: String(m.sender_icon) } : {}),
              })
            }
            setMessages(historyMessages)
            break
          }

          case "message": {
            setIsTyping(false)
            const payload = ev.payload as Record<string, unknown> | undefined
            if (!payload || payload.user_type !== "ai") break

            if (payload.session_id && typeof payload.session_id === "string" && !getSessionId()) {
              setSessionId(payload.session_id)
            }

            const chatData = payload.chat_data as Record<string, unknown> | undefined
            const aiResponse = chatData?.ai_response as Record<string, unknown> | undefined
            const text = aiResponse?.ai_message ?? payload.message ?? JSON.stringify(payload)
            const rawProducts = aiResponse?.product_info as unknown[] | undefined
            const products: ProductInfo[] | undefined = rawProducts?.length
              ? (rawProducts as Record<string, unknown>[]).map(p => ({
                  id: String(p.id ?? ""),
                  name: String(p.name ?? ""),
                  description: String(p.description ?? ""),
                  price: Number(p.price ?? 0),
                  sku: String(p.sku ?? ""),
                  image_url: String(p.image_url ?? ""),
                  category: String(p.category ?? ""),
                  tags: String(p.tags ?? ""),
                  currency: String(p.currency ?? "GBP"),
                  available: Boolean(p.available ?? true),
                  url: String(p.url ?? ""),
                }))
              : undefined

            push("morgan", String(text), products)
            break
          }

          case "error": {
            setIsTyping(false)
            const payload = ev.payload as Record<string, unknown> | undefined
            console.error("[elxBot] error", payload?.code ?? "", payload?.message ?? "")
            break
          }

          case "session_ended": {
            console.log("[elxBot] Conversation Ended")
            break
          }
        }
      },
    })

    conversationRef.current = conv
    return true
  }

  // ─── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      conversationRef.current?.disconnect()
      conversationRef.current = null
    }
  }, [])

  async function handleTextSend() {
    if (!textInput.trim()) return
    if (!(await ensureConversation())) return
    const msg = textInput
    push("user", msg)
    setTextInput("")
    setIsTyping(true)
    conversationRef.current?.send(msg)
  }

  const tabs = [
    { v: "quote" as ViewMode, icon: <FileText size={14} />, label: "Quote" },
    { v: "faq" as ViewMode, icon: <MessageSquare size={14} />, label: "FAQ" },
    { v: "advice" as ViewMode, icon: <Sparkles size={14} />, label: "Advice" },
    { v: "chat" as ViewMode, icon: <Headphones size={14} />, label: "Human" },
  ]

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", fontFamily: "'Lato', 'Quicksand', Arial, sans-serif", background: GREY_BG }}>
      <style>{`@keyframes typingDot{0%,60%,100%{opacity:0.3}30%{opacity:1}}`}</style>

      {/* Top bar */}
      <div style={{ background: NAVY_DARK, color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.3px", fontFamily: "'Quicksand', Lato, sans-serif" }}>C2O</div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: 13, opacity: 0.85 }}>Customer Engine</div>
          <div style={{ fontSize: 10, fontWeight: 700, background: GOLD, color: NAVY_DARK, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px" }}>MVP</div>
        </div>
        <button onClick={() => {
          setView("home"); setMessages([]); setStep(0); setAnswers({ qty: 50 })
          setSelectedTier(null); setSelectedProduct(null); setActionView(""); setTextInput(""); setTierBuckets([])
          conversationRef.current?.disconnect(); conversationRef.current = null; clearSessionId()
        }}
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          <RefreshCw size={12} /> Reset
        </button>
      </div>

      {/* Sub-header */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {view !== "home" && (
            <button onClick={goBack} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft size={14} />
            </button>
          )}
          <MorganAvatar size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.2, fontFamily: "'Quicksand', Lato, sans-serif" }}>Morgan</div>
            <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              {view === "home" && "Always on · 24/7"}
              {view === "quote" && (step < quoteSteps.length ? `Express Quote · Step ${step + 1} of ${quoteSteps.length}` : "Quote ready")}
              {view === "faq" && "Answering questions"}
              {view === "advice" && "Product advice"}
              {view === "chat" && "Live chat — Sarah"}
            </div>
          </div>
        </div>
        {view !== "home" && (
          <button onClick={() => setView("home")} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={14} /> Home
          </button>
        )}
      </div>

      {/* Progress bar */}
      {view === "quote" && step < quoteSteps.length && (
        <div style={{ height: 3, background: BORDER, flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${((step + 1) / quoteSteps.length) * 100}%`, background: NAVY, transition: "width 0.3s" }} />
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
        {view === "home" ? renderHome() : (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {messages.map(m => (
              <div key={m.id}>
                <Bubble role={m.role} text={m.text} senderIcon={m.senderIcon} />
                {m.products && m.products.length > 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", gap: 10,
                    marginBottom: 12, marginLeft: m.role === "user" ? "auto" : 0,
                    maxWidth: "85%", paddingLeft: m.role === "user" ? 0 : 36,
                  }}>
                    {m.products.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            ))}

            {/* ── Typing indicator ── */}
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <MorganAvatar size={28} />
                <div style={{
                  padding: "10px 16px", borderRadius: "4px 18px 18px 18px",
                  background: "#fff", border: `1px solid ${BORDER}`,
                  fontSize: 14, color: MUTED,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: MUTED, animation: "typingDot 1.2s infinite",
                  }} />
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: MUTED, animation: "typingDot 1.2s infinite 0.2s",
                  }} />
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: MUTED, animation: "typingDot 1.2s infinite 0.4s",
                  }} />
                </div>
              </div>
            )}

            {/* quote step options — NO text input */}
            {view === "quote" && step < quoteSteps.length && (
              <div style={{ marginTop: 8 }}>{renderStep()}</div>
            )}

            {/* engine-generated tier results */}
            {view === "quote" && step >= quoteSteps.length && (
              <div style={{ marginTop: 8 }}>{renderTierResults()}</div>
            )}

            {/* FAQ chips */}
            {view === "faq" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {FAQ_CHIPS.map(chip => (
                  <QuickReply key={chip} label={chip} onClick={() => {
                    push("user", chip)
                    setTimeout(() => push("morgan", `"${chip}": our minimum is 10 items, delivery typically 5–7 working days. Call us on 0800 000 000 for rush orders.`), 500)
                  }} />
                ))}
              </div>
            )}

            {/* Advice chips */}
            {view === "advice" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {ADVICE_CHIPS.map(chip => (
                  <QuickReply key={chip} label={chip} onClick={() => {
                    push("user", chip)
                    setTimeout(() => push("morgan", `For "${chip}" I'd recommend our Everyday or Premium tier. Shall I run a full quote?`), 500)
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text input (faq / advice / chat only) */}
      {showTextInput && (
        <div style={{ padding: "14px 24px 0", background: "#fff", flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
            <input value={textInput} onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTextSend()}
              placeholder={view === "faq" ? "Type your own question…" : view === "chat" ? "Type your message…" : "Describe what you need…"}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <button onClick={handleTextSend} style={{ padding: "11px 14px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <div style={{ padding: "12px 24px 16px", background: "#fff", borderTop: showTextInput ? "none" : `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {tabs.map(c => {
            const isActive = view === c.v
            return (
              <button key={c.v} onClick={() => startCapability(c.v)}
                style={{ padding: "9px 16px", borderRadius: 22, border: `2px solid ${NAVY}`, background: isActive ? NAVY : "#fff", color: isActive ? "#fff" : NAVY, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: isActive ? "0 2px 6px rgba(74,144,226,0.25)" : "none" }}>
                {c.icon} {c.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
