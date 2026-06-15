"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  FileText, MessageSquare, Headphones, Sparkles, Send, ArrowLeft, X,
  RefreshCw, Info, Phone, Mail, ShoppingCart, Minus, Plus,
} from "lucide-react"
import {
  NAVY, NAVY_DARK, NAVY_LIGHT, GOLD, INK, MUTED, BORDER, GREY_BG,
  GREEN, AMBER, USE_CASES, PRIORITIES, DECORATION_TYPES, LOGO_POSITIONS,
  LOGO_STATUS, DEADLINE_OPTIONS, FAQ_CHIPS, ADVICE_CHIPS,
} from "./data"
import type { ViewMode, Message, QuoteAnswers, ProductInfo } from "./types"
import { runQuoteEngine, getCategories, getProductsForCategory } from "@/lib/quoteEngine"
import type { TierBucket } from "@/lib/quoteEngine"

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
  const [answers, setAnswers] = useState<QuoteAnswers>({ qty: 50 })
  const [step, setStep] = useState(0)
  const [textInput, setTextInput] = useState("")
  const [tierBuckets, setTierBuckets] = useState<TierBucket[]>([])
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [actionView, setActionView] = useState<"" | "email" | "callback" | "order">("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, step, tierBuckets])

  const push = useCallback((role: Message["role"], text: string, products?: ProductInfo[], senderIcon?: string) => {
    setMessages(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, ...(products ? { products } : {}), ...(senderIcon ? { senderIcon } : {}) }])
  }, [])

  // ─── 8 quote steps ──────────────────────────────────────────────
  const quoteSteps = [
    { key: "purpose", question: "What's the main purpose of this order?" },
    { key: "qty", question: "How many items do you need?" },
    { key: "priority", question: "What matters most to you?" },
    { key: "category", question: "What type of garment are you looking for?" },
    { key: "decorationType", question: "How would you like your logo applied?" },
    { key: "logoPosition", question: "Where should the logo go?" },
    { key: "logoStatus", question: "What's the status of your logo/artwork?" },
    { key: "deadline", question: "When do you need the order?" },
  ]

  async function startCapability(v: ViewMode) {
    setView(v); setMessages([]); setStep(0)
    setAnswers({ qty: 50 }); setSelectedTier(null)
    setActionView(""); setTextInput(""); setTierBuckets([])
    if (v === "quote") push("morgan", "Great! Let's get you an instant quote — I'll ask 8 quick questions.")
    if (v === "faq") push("morgan", "Hi! Pick a topic or type your own question below.")
    if (v === "advice") push("morgan", "I'll help you find the perfect product. Pick a scenario or describe what you need.")
    if (v === "chat") push("morgan", "Connecting you to our team… You're through to Sarah 👋 How can I help?")
    // Lazy-create chatbot conversation (only for faq/advice/chat)
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
        // run engine
        push("morgan", "Calculating your personalised quote from our live product catalogue…")
        setTimeout(() => {
          const input = {
            purpose: updated.purpose ?? "",
            qty: updated.qty ?? 50,
            priority: (updated.priority ?? "Balance") as "Speed" | "Balance" | "Quality",
            category: updated.category ?? "t-shirts",
            decorationType: (updated.decorationType ?? "Printing") as "Printing" | "Embroidery",
            logoPosition: updated.logoPosition ?? "5. Left Chest",
            logoStatus: updated.logoStatus ?? "",
            deadline: updated.deadline ?? "flexible",
          }
          const buckets = runQuoteEngine(input)
          setTierBuckets(buckets)
          push("morgan", `Here are ${buckets.length} pricing tiers for ${input.qty} × ${input.decorationType} on ${input.category}. Tap any tier to see the full breakdown.`)
          setStep(nextStep)
        }, 400)
      }
    }, 300)
  }

  function goBack() {
    if (view === "quote" && step > 0 && step <= quoteSteps.length) {
      setStep(s => s - 1)
      setMessages(m => m.slice(0, -2))
      if (step >= quoteSteps.length) { setTierBuckets([]); setSelectedTier(null) }
    } else {
      setView("home")
    }
  }

  // ─── Step renderers ─────────────────────────────────────────────
  function renderStep() {
    const current = quoteSteps[step]
    if (!current) return null

    switch (current.key) {
      case "purpose":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {USE_CASES.map(u => (
              <button key={u.id} onClick={() => handleQuoteAnswer("purpose", u.label)}
                style={{ padding: "12px 10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{u.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 4 }}>{u.label}</div>
              </button>
            ))}
          </div>
        )

      case "qty":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0" }}>
            <button onClick={() => setAnswers(a => ({ ...a, qty: Math.max(1, (a.qty ?? 50) - 10) }))}
              style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Minus size={16} />
            </button>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, minWidth: 70, textAlign: "center" }}>
              {answers.qty}
            </div>
            <button onClick={() => setAnswers(a => ({ ...a, qty: Math.min(1000, (a.qty ?? 50) + 10) }))}
              style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={16} />
            </button>
            <button onClick={() => handleQuoteAnswer("qty", answers.qty ?? 50)}
              style={{ padding: "10px 20px", borderRadius: 8, background: NAVY, color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
              Confirm →
            </button>
          </div>
        )

      case "priority":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PRIORITIES.map(p => (
              <button key={p.id} onClick={() => handleQuoteAnswer("priority", p.id, p.label)}
                style={{ padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{p.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )

      case "category": {
        const cats = getCategories()
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {cats.map(c => {
              const count = getProductsForCategory(c.id).length
              return (
                <button key={c.id} onClick={() => handleQuoteAnswer("category", c.id, c.label)}
                  style={{ padding: "14px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 28 }}>{c.emoji}</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 6 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{count} products</div>
                </button>
              )
            })}
          </div>
        )
      }

      case "decorationType":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {DECORATION_TYPES.map(d => (
              <button key={d.id} onClick={() => handleQuoteAnswer("decorationType", d.id, d.label)}
                style={{ padding: "14px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 24 }}>{d.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 6 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{d.desc}</div>
                <div style={{ fontSize: 11, color: NAVY, fontWeight: 600, marginTop: 4 }}>{d.setupNote}</div>
              </button>
            ))}
          </div>
        )

      case "logoPosition":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LOGO_POSITIONS.map(p => (
              <QuickReply key={p.id} label={p.label} onClick={() => handleQuoteAnswer("logoPosition", p.id, p.label)} />
            ))}
          </div>
        )

      case "logoStatus":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LOGO_STATUS.map(ls => (
              <button key={ls.id} onClick={() => handleQuoteAnswer("logoStatus", ls.label)}
                style={{ padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{ls.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{ls.label}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{ls.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )

      case "deadline":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DEADLINE_OPTIONS.map(d => (
              <QuickReply key={d.id} label={d.label} onClick={() => handleQuoteAnswer("deadline", d.id, d.label)} />
            ))}
          </div>
        )

      default: return null
    }
  }

  // ─── Tier results ───────────────────────────────────────────────
  function renderTierResults() {
    if (tierBuckets.length === 0) return (
      <div style={{ padding: 20, textAlign: "center", color: MUTED, fontSize: 14 }}>
        No products found matching all your criteria. Try a different position or decoration type.
      </div>
    )

    if (selectedTier) {
      const t = tierBuckets.find(b => b.tierId === selectedTier)!
      const topProducts = t.products.slice(0, 5)

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
              ["Tier", `${t.emoji} ${t.tierName}`],
              ["Product", topProducts[0]?.product.name ?? "—"],
              ["Qty", `${answers.qty} items`],
              ["Unit price (decorated)", `£${t.unitPrice.toFixed(2)}`],
              ["Setup fee", `£${t.setupFee.toFixed(2)}`],
              ["Est. total", `£${t.totalPrice.toFixed(2)}`],
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

      // Selected tier breakdown
      return (
        <div>
          <div style={{ background: "#fff", borderRadius: 12, border: `2px solid ${t.color}`, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{t.tierName} Tier</div>
                  {t.badge && <span style={{ fontSize: 10, fontWeight: 700, background: t.color, color: "#fff", padding: "2px 7px", borderRadius: 4 }}>{t.badge}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: t.color }}>£{t.totalPrice.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: MUTED }}>est. total for {answers.qty} items</div>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Unit (decorated)", value: `£${t.unitPrice.toFixed(2)}` },
                { label: "Setup fee", value: `£${t.setupFee.toFixed(2)}` },
                { label: "Delivery", value: t.delivery },
              ].map(row => (
                <div key={row.label} style={{ textAlign: "center", background: GREY_BG, borderRadius: 8, padding: "10px 6px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{row.value}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{row.label}</div>
                </div>
              ))}
            </div>

            {/* Top products in this tier */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Top picks in this tier ({t.products.length} products matched)
              </div>
              {topProducts.map(r => (
                <div key={r.product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{r.product.name}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{r.product.brand} · {typeof r.product.fabric === "object" ? (r.product.fabric as { weight?: string }).weight ?? "" : r.product.fabric ?? ""}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.color }}>£{r.totalOrderPrice.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>£{r.unitDecoratedPrice.toFixed(2)}/unit</div>
                  </div>
                </div>
              ))}
            </div>

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
          <button onClick={() => { setSelectedTier(null); setActionView("") }} style={{ fontSize: 13, color: MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
            ← View all tiers
          </button>
        </div>
      )
    }

    // All tiers overview
    return (
      <div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
          Pricing for <strong style={{ color: INK }}>{answers.qty} items</strong> · <strong style={{ color: INK }}>{answers.decorationType}</strong> · <strong style={{ color: INK }}>{answers.category}</strong> — tap a tier to see products & breakdown.
        </div>
        {tierBuckets.map(t => (
          <button key={t.tierId} onClick={() => setSelectedTier(t.tierId)}
            style={{ width: "100%", marginBottom: 8, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t.tierName}</span>
                  {t.badge && <span style={{ fontSize: 10, fontWeight: 700, background: t.color, color: "#fff", padding: "1px 6px", borderRadius: 4 }}>{t.badge}</span>}
                </div>
                <div style={{ fontSize: 12, color: MUTED }}>
                  £{t.unitPrice.toFixed(2)}/unit · {t.products.length} products · {t.delivery}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: t.color }}>£{t.totalPrice.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: MUTED }}>est. total</div>
            </div>
          </button>
        ))}
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
          <div><strong>Live data.</strong> Pricing is calculated in real time from our product catalogue using your quantity, decoration type and logo position.</div>
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
          setSelectedTier(null); setActionView(""); setTextInput(""); setTierBuckets([])
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
