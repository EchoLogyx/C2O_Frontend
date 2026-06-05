// ─── Colour palette ───────────────────────────────────────────────
export const NAVY       = '#4A90E2'
export const NAVY_DARK  = '#1e3a5f'
export const NAVY_LIGHT = '#bfdbfe'
export const GOLD       = '#d4a574'
export const INK        = '#111827'
export const MUTED      = '#6b7280'
export const BORDER     = '#e5e7eb'
export const GREY_BG    = '#f8fafc'
export const GREEN      = '#16a34a'
export const AMBER      = '#d97706'

// ─── UI-only constants (products/tiers sourced from allProductsData.json via engine) ──

export const USE_CASES = [
  { id: 'uniforms',  label: 'Company Uniforms',      emoji: '🏢' },
  { id: 'sports',    label: 'Sports & Teamwear',     emoji: '⚽' },
  { id: 'events',    label: 'Events & Promotions',   emoji: '🎉' },
  { id: 'charity',   label: 'Charity & Fundraising', emoji: '❤️' },
  { id: 'schools',   label: 'Schools & Education',   emoji: '🎓' },
  { id: 'retail',    label: 'Retail & Merchandise',  emoji: '🛍️' },
]

export const PRIORITIES = [
  { id: 'Speed',   label: 'Speed',   emoji: '⚡', desc: 'Need it fast — next day available' },
  { id: 'Balance', label: 'Balance', emoji: '⚖️', desc: 'Best value for money' },
  { id: 'Quality', label: 'Quality', emoji: '💎', desc: 'Premium finish & durability' },
]

export const DECORATION_TYPES = [
  { id: 'Embroidery', label: 'Embroidery',   emoji: '🧵', desc: 'Textured premium finish (+30%)', setupNote: '£35 setup' },
  { id: 'Printing',   label: 'Screen Print', emoji: '🖨️', desc: 'Vivid flat colour (+20%)',       setupNote: '£25 setup' },
]

// Positions match actual availablePositions keys in allProductsData.json
export const LOGO_POSITIONS = [
  { id: '5. Left Chest',   label: 'Left Chest' },
  { id: '4. Centre Chest', label: 'Centre Chest' },
  { id: '3. Right Chest',  label: 'Right Chest' },
  { id: '8. Centre Back',  label: 'Centre Back' },
  { id: '9. Top Back',     label: 'Top Back' },
  { id: '7. Left Sleeve',  label: 'Left Sleeve' },
  { id: '1. Right Sleeve', label: 'Right Sleeve' },
]

export const LOGO_STATUS = [
  { id: 'ready',   label: 'Ready to go',     emoji: '✅', desc: 'I have print-ready files' },
  { id: 'design',  label: 'Need design help', emoji: '🎨', desc: 'I need artwork support' },
  { id: 'explore', label: 'Just exploring',   emoji: '🔍', desc: 'Still early stage' },
]

export const DEADLINE_OPTIONS = [
  { id: 'asap',     label: 'ASAP (next day)' },
  { id: 'week2',    label: 'Within 2 weeks' },
  { id: 'month',    label: 'Within a month' },
  { id: 'flexible', label: "I'm flexible" },
]

export const FAQ_CHIPS = [
  'Minimum orders', 'Delivery times', 'Logo file formats',
  'Colour matching', 'Returns policy', 'Rush orders',
]

export const ADVICE_CHIPS = [
  'Best for school sports day',
  'Smart look for office team',
  'Budget event giveaway',
  'Premium retail merchandise',
]
