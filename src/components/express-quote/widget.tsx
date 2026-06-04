"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  FileText, MessageSquare, Headphones, Sparkles, Send, ArrowLeft, X,
  RefreshCw, Info, ChevronRight, CheckCircle, Phone, Mail, ShoppingCart,
  Minus, Plus, ChevronLeft,
} from "lucide-react"
import {
  NAVY, NAVY_DARK, NAVY_LIGHT, GOLD, INK, MUTED, BORDER, GREY_BG,
  GREEN, AMBER, PRODUCTS, PRODUCT_TYPES, USE_CASES, PRIORITIES,
  PLACEMENTS, METHODS, LOGO_STATUS, DEADLINE_OPTIONS, TIERS,
  FAQ_CHIPS, ADVICE_CHIPS,
} from "./data"
import type { ViewMode, Message, QuoteAnswers } from "./types"

// ─── Morgan Avatar ────────────────────────────────────────────────
function MorganAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, flexShrink: 0,
        boxShadow: "0 2px 8px rgba(74,144,226,0.35)",
      }}
    >
      🤖
    </div>
  )
}

// ─── Chat bubble ──────────────────────────────────────────────────
function Bubble({ role, text }: { role: Message["role"]; text: string }) {
  const isUser = role === "user"
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 10 }}>
      {!isUser && (
        <div style={{ marginRight: 8, marginTop: 2 }}>
          <MorganAvatar size={28} />
        </div>
      )}
      <div
        style={{
          maxWidth: "75%", padding: "10px 14px", borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          background: isUser ? NAVY : "#fff",
          color: isUser ? "#fff" : INK,
          fontSize: 14, lineHeight: 1.55,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          border: isUser ? "none" : `1px solid ${BORDER}`,
        }}
      >
        {text}
      </div>
    </div>
  )
}

// ─── Quick-reply pill ─────────────────────────────────────────────
function QuickReply({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px", borderRadius: 20,
        border: `1.5px solid ${active ? NAVY : BORDER}`,
        background: active ? NAVY : "#fff",
        color: active ? "#fff" : INK,
        fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  )
}

// ─── Compute tier prices ───────────────────────────────────────────
function computeTiers(qty: number) {
  const qtyDiscount = qty >= 100 ? 0.85 : qty >= 50 ? 0.92 : qty >= 25 ? 0.96 : 1
  return TIERS.map(t => {
    const unitPrice = parseFloat((t.baseUnit * qtyDiscount).toFixed(2))
    const totalPrice = parseFloat((unitPrice * qty + t.setup).toFixed(2))
    return { ...t, unitPrice, totalPrice, setupFee: t.setup }
  })
}

// ─── Main widget ──────────────────────────────────────────────────
export function ExpressQuoteWidget() {
  const [view, setView]           = useState<ViewMode>("home")
  const [messages, setMessages]   = useState<Message[]>([])
  const [answers, setAnswers]     = useState<QuoteAnswers>({ qty: 50 })
  const [step, setStep]           = useState(0)
  const [textInput, setTextInput] = useState("")
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [actionView, setActionView]     = useState<"" | "email" | "callback" | "order">("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // auto-scroll on message push
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, step, view])

  const push = useCallback((role: Message["role"], text: string, stepIdx?: number) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, step: stepIdx }])
  }, [])

  // ─── Quote steps definition ──────────────────────────────────────
  const quoteSteps = [
    { key: "useCase",     question: "What's the main purpose of this order?" },
    { key: "qty",         question: "How many items do you need?" },
    { key: "priority",    question: "What matters most to you?" },
    { key: "productType", question: "What type of garment are you looking for?" },
    { key: "product",     question: "Pick the product you'd like quoted:" },
    { key: "placement",   question: "Where should the logo/design go?" },
    { key: "method",      question: "How would you like your logo applied?" },
    { key: "logoStatus",  question: "What's the status of your logo?" },
    { key: "deadline",    question: "When do you need the order?" },
  ]

  // ─── Start a capability ──────────────────────────────────────────
  function startCapability(v: ViewMode) {
    setView(v)
    setMessages([])
    setStep(0)
    setAnswers({ qty: 50 })
    setSelectedTier(null)
    setActionView("")
    setTextInput("")

    if (v === "quote") {
      push("morgan", "Great! Let's get you an instant quote. I'll ask a few quick questions.", 0)
    } else if (v === "faq") {
      push("morgan", "Hi! I can answer questions about ordering, delivery, and more. Pick a topic or type your own.")
    } else if (v === "advice") {
      push("morgan", "I'll help you find the perfect product. Pick a scenario or describe what you need.")
    } else if (v === "chat") {
      push("morgan", "Connecting you to our team… You're through to Sarah 👋 How can I help?")
    }
  }

  // ─── Record a quote answer ────────────────────────────────────────
  function handleQuoteAnswer(key: string, value: string | number) {
    const label = typeof value === "string" ? value : `${value} items`
    push("user", label, step)
    const nextStep = step + 1
    setAnswers(prev => ({ ...prev, [key]: value }))
    setTimeout(() => {
      if (nextStep < quoteSteps.length) {
        push("morgan", quoteSteps[nextStep].question, nextStep)
        setStep(nextStep)
      } else {
        push("morgan", "Perfect! Here are your 5 pricing options based on your requirements.")
        setStep(nextStep)
      }
    }, 350)
  }

  function goBack() {
    if (view === "quote" && step > 0 && step < quoteSteps.length) {
      const prev = step - 1
      setStep(prev)
      // remove last two messages (user answer + morgan question for current step)
      setMessages(m => m.slice(0, -2))
    } else if (view === "quote" && step >= quoteSteps.length) {
      setStep(quoteSteps.length - 1)
      setMessages(m => m.slice(0, -2))
      setSelectedTier(null)
      setActionView("")
    } else {
      setView("home")
    }
  }

  // ─── FAQ text submit ──────────────────────────────────────────────
  function handleFAQText() {
    if (!textInput.trim()) return
    push("user", textInput)
    setTextInput("")
    setTimeout(() => {
      push("morgan", "Thanks for your question! Our standard minimum order is 10 items. Typical delivery is 5–7 working days. For further help contact team@c2o.co.uk.")
    }, 600)
  }

  // ─── Render quote step inline options ────────────────────────────
  function renderQuoteStep() {
    const current = quoteSteps[step]
    if (!current) return null

    switch (current.key) {
      case "useCase":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {USE_CASES.map(u => (
              <button key={u.id} onClick={() => handleQuoteAnswer("useCase", u.label)}
                style={{ padding: "12px 10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{u.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginTop: 4 }}>{u.label}</div>
              </button>
            ))}
          </div>
        )

      case "qty":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0" }}>
            <button onClick={() => setAnswers(a => ({ ...a, qty: Math.max(10, (a.qty ?? 50) - 10) }))}
              style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Minus size={16} />
            </button>
            <div style={{ fontSize: 28, fontWeight: 800, color: NAVY, minWidth: 70, textAlign: "center" }}>
              {answers.qty ?? 50}
            </div>
            <button onClick={() => setAnswers(a => ({ ...a, qty: Math.min(500, (a.qty ?? 50) + 10) }))}
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
              <button key={p.id} onClick={() => handleQuoteAnswer("priority", p.label)}
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

      case "productType":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {PRODUCT_TYPES.map(pt => (
              <button key={pt.id} onClick={() => handleQuoteAnswer("productType", pt.id)}
                style={{ padding: "14px 12px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 28 }}>{pt.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 6 }}>{pt.label}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{pt.desc}</div>
              </button>
            ))}
          </div>
        )

      case "product": {
        const typeId = answers.productType ?? "tshirts"
        const list = PRODUCTS[typeId] ?? []
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {list.map(p => (
              <button key={p.id} onClick={() => handleQuoteAnswer("product", p.name)}
                style={{ padding: "12px 10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{p.fabric}</div>
              </button>
            ))}
          </div>
        )
      }

      case "placement":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PLACEMENTS.map(pl => (
              <QuickReply key={pl.id} label={pl.label} onClick={() => handleQuoteAnswer("placement", pl.label)} />
            ))}
          </div>
        )

      case "method":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {METHODS.map(m => (
              <button key={m.id} onClick={() => handleQuoteAnswer("method", m.label)}
                style={{ padding: "12px 10px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{m.emoji}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 4 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{m.desc}</div>
              </button>
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
              <QuickReply key={d.id} label={d.label} onClick={() => handleQuoteAnswer("deadline", d.label)} />
            ))}
          </div>
        )

      default:
        return null
    }
  }

  // ─── Render quote results ─────────────────────────────────────────
  function renderQuoteResults() {
    const tierData = computeTiers(answers.qty ?? 50)

    if (selectedTier) {
      const t = tierData.find(x => x.id === selectedTier)!
      if (actionView === "email") {
        return (
          <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>📧 Email your quote</div>
            <input placeholder="Your email address" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <input placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", marginTop: 8, boxSizing: "border-box" }} />
            <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: NAVY, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Send quote to my inbox
            </button>
            <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back
            </button>
          </div>
        )
      }
      if (actionView === "callback") {
        return (
          <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>📞 Request a callback</div>
            <input placeholder="Your phone number" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <input placeholder="Best time to call" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", marginTop: 8, boxSizing: "border-box" }} />
            <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: GREEN, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Request callback
            </button>
            <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back
            </button>
          </div>
        )
      }
      if (actionView === "order") {
        return (
          <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${BORDER}`, padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 4 }}>🛒 Confirm order intent</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>We'll contact you to finalise artwork, sizes and payment.</div>
            <div style={{ background: GREY_BG, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: MUTED }}>Tier</span><strong>{t.emoji} {t.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: MUTED }}>Qty</span><strong>{answers.qty} items</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: MUTED }}>Total est.</span><strong style={{ color: NAVY }}>£{t.totalPrice.toFixed(2)}</strong>
              </div>
            </div>
            <input placeholder="Full name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <input placeholder="Email" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 8, background: AMBER, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Confirm order intent
            </button>
            <button onClick={() => setActionView("")} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 8, background: "transparent", color: MUTED, border: `1px solid ${BORDER}`, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              ← Back
            </button>
          </div>
        )
      }

      // selected tier breakdown
      return (
        <div>
          <div style={{ background: "#fff", borderRadius: 12, border: `2px solid ${t.color}`, padding: 20, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{t.name} Tier</div>
                  {t.badge && <span style={{ fontSize: 10, fontWeight: 700, background: t.color, color: "#fff", padding: "2px 7px", borderRadius: 4 }}>{t.badge}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: t.color }}>£{t.totalPrice.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: MUTED }}>total incl. setup</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
              {[
                { label: "Unit price", value: `£${t.unitPrice.toFixed(2)}` },
                { label: "Setup fee", value: `£${t.setupFee}` },
                { label: "Delivery", value: t.delivery },
              ].map(row => (
                <div key={row.label} style={{ textAlign: "center", background: GREY_BG, borderRadius: 8, padding: "10px 6px" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{row.value}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{row.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setActionView("email")} style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 8, background: NAVY, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Mail size={14} /> Email quote
              </button>
              <button onClick={() => setActionView("callback")} style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 8, background: GREEN, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Phone size={14} /> Callback
              </button>
              <button onClick={() => setActionView("order")} style={{ flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 8, background: AMBER, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <ShoppingCart size={14} /> Order now
              </button>
            </div>
          </div>
          <button onClick={() => setSelectedTier(null)} style={{ fontSize: 13, color: MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
            ← View all tiers
          </button>
        </div>
      )
    }

    // all tiers list
    return (
      <div>
        <div style={{ fontSize: 14, color: MUTED, marginBottom: 12 }}>Showing pricing for <strong style={{ color: INK }}>{answers.qty} items</strong> — tap a tier to see full breakdown.</div>
        {tierData.map(t => (
          <button key={t.id} onClick={() => setSelectedTier(t.id)} style={{ width: "100%", marginBottom: 8, padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t.name}</span>
                  {t.badge && <span style={{ fontSize: 10, fontWeight: 700, background: t.color, color: "#fff", padding: "1px 6px", borderRadius: 4 }}>{t.badge}</span>}
                </div>
                <div style={{ fontSize: 12, color: MUTED }}>£{t.unitPrice.toFixed(2)}/unit · {t.delivery}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: t.color }}>£{t.totalPrice.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: MUTED }}>total</div>
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ─── Home screen ──────────────────────────────────────────────────
  function renderHome() {
    const modes = [
      { v: "quote" as ViewMode, icon: <FileText size={18} />, label: "Get a quote", sub: "Five priced options in 2 min", color: NAVY },
      { v: "faq" as ViewMode,   icon: <MessageSquare size={18} />, label: "Ask a question", sub: "Setup, delivery, minimums", color: "#7c3aed" },
      { v: "chat" as ViewMode,  icon: <Headphones size={18} />, label: "Speak to a person", sub: "Live team — 9am to 5pm", color: GREEN },
      { v: "advice" as ViewMode,icon: <Sparkles size={18} />, label: "Help me choose", sub: "Product advice", color: AMBER },
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
          <div><strong>Demo mode.</strong> All pricing and products are illustrative. Production will use a tuned LLM over the C2O knowledge base.</div>
        </div>
      </div>
    )
  }

  // ─── Footer tab bar ───────────────────────────────────────────────
  const tabs = [
    { v: "quote" as ViewMode,  icon: <FileText size={14} />,      label: "Quote" },
    { v: "faq" as ViewMode,    icon: <MessageSquare size={14} />, label: "FAQ" },
    { v: "advice" as ViewMode, icon: <Sparkles size={14} />,      label: "Advice" },
    { v: "chat" as ViewMode,   icon: <Headphones size={14} />,    label: "Human" },
  ]

  const showTextInput = view === "faq" || view === "chat" || view === "advice"

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", fontFamily: "'Lato', 'Quicksand', Arial, sans-serif", background: GREY_BG }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div style={{ background: NAVY_DARK, color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid rgba(255,255,255,0.1)`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.3px", fontFamily: "'Quicksand', Lato, sans-serif" }}>C2O</div>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: 13, opacity: 0.85 }}>Customer Engine</div>
          <div style={{ fontSize: 10, fontWeight: 700, background: GOLD, color: NAVY_DARK, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.5px" }}>MVP DEMO</div>
        </div>
        <button onClick={() => { setView("home"); setMessages([]); setStep(0); setAnswers({ qty: 50 }); setSelectedTier(null); setActionView(""); setTextInput("") }}
          style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          <RefreshCw size={12} /> Reset demo
        </button>
      </div>

      {/* ── Sub-header ───────────────────────────────────────────── */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${BORDER}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {view !== "home" && (
            <button onClick={goBack}
              style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, width: 28, height: 28, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ArrowLeft size={14} />
            </button>
          )}
          <MorganAvatar size={32} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.2, fontFamily: "'Quicksand', Lato, sans-serif" }}>Morgan</div>
            <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              {view === "home"   && "Always on · 24/7"}
              {view === "quote"  && `Express Quote · Step ${Math.min(step + 1, quoteSteps.length)} of ${quoteSteps.length}`}
              {view === "faq"    && "Answering questions"}
              {view === "advice" && "Product advice"}
              {view === "chat"   && "Live chat — Sarah"}
              {view === "order"  && "Order placed"}
            </div>
          </div>
        </div>
        {view !== "home" && (
          <button onClick={() => setView("home")}
            style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            <X size={14} /> Home
          </button>
        )}
      </div>

      {/* ── Progress bar (quote mode) ─────────────────────────────── */}
      {view === "quote" && step < quoteSteps.length && (
        <div style={{ height: 3, background: BORDER, flexShrink: 0 }}>
          <div style={{ height: "100%", width: `${((step + 1) / quoteSteps.length) * 100}%`, background: NAVY, transition: "width 0.3s" }} />
        </div>
      )}

      {/* ── Scrollable content area ───────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
        {view === "home" ? renderHome() : (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* chat bubbles */}
            {messages.map(m => <Bubble key={m.id} role={m.role} text={m.text} />)}

            {/* inline step options (quote only — no text input) */}
            {view === "quote" && step < quoteSteps.length && (
              <div style={{ marginTop: 8 }}>{renderQuoteStep()}</div>
            )}

            {/* quote results */}
            {view === "quote" && step >= quoteSteps.length && (
              <div style={{ marginTop: 8 }}>{renderQuoteResults()}</div>
            )}

            {/* FAQ chips */}
            {view === "faq" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {FAQ_CHIPS.map(chip => (
                  <QuickReply key={chip} label={chip} onClick={() => {
                    push("user", chip)
                    setTimeout(() => push("morgan", `Great question about "${chip}". Our team is available Mon–Fri 9am–5pm and will respond within 2 hours. For urgent queries call 0800 123 456.`), 500)
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
                    setTimeout(() => push("morgan", `For "${chip}", I'd recommend our Everyday or Premium tier — great balance of quality and price. Shall I kick off a quote for you?`), 500)
                  }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Text input (faq / advice / chat only) ────────────────── */}
      {showTextInput && (
        <div style={{ padding: "14px 24px 0", background: "#fff", flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 8 }}>
            <input
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key !== "Enter" || !textInput.trim()) return
                if (view === "faq") { handleFAQText(); return }
                push("user", textInput)
                setTextInput("")
                setTimeout(() => {
                  if (view === "chat") push("human", "Thanks — let me check that for you.")
                  else push("morgan", `Great question! I'd suggest exploring our Everyday tier — it's our most popular. Want me to run a quick quote?`)
                }, 600)
              }}
              placeholder={view === "faq" ? "Type your own question…" : view === "chat" ? "Type your message…" : "Describe what you need…"}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 14, fontFamily: "inherit", outline: "none" }}
            />
            <button
              onClick={() => {
                if (!textInput.trim()) return
                if (view === "faq") { handleFAQText(); return }
                push("user", textInput)
                setTextInput("")
                setTimeout(() => {
                  if (view === "chat") push("human", "Thanks — let me check that for you.")
                  else push("morgan", `Great question! I'd suggest exploring our Everyday tier — it's our most popular. Want me to run a quick quote?`)
                }, 600)
              }}
              style={{ padding: "11px 14px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom nav tabs ───────────────────────────────────────── */}
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
