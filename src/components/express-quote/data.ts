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

// ─── Purpose → tag/sector mapping (from HTML) ───────────────────
export const PURPOSE_MAP: Record<string, { tags: string[]; sector?: string[] }> = {
  "Company Uniforms":     { tags: ["Uniform","Workwear","Hospitality","Security","Healthcare"] },
  "Sports & Teamwear":    { tags: ["Teamwear","Sportswear","Golf","Tennis"] },
  "Events & Promotions":  { tags: ["Promotions","Tradeshows","Stag Do","Hen Do"] },
  "Charity & Fundraising":{ tags: ["Charities"] },
  "School & Education":   { tags: ["Schoolwear","Leavers Hoodies"], sector: ["Education"] },
  "Retail & Merchandise": { tags: ["Merchandise","Fashion","Gifts"] },
}

// ─── UI-only constants ───────────────────────────────────────────
export const SPEED_OPTIONS = [
  { id: 'Next day', label: 'Next day (order before 12:00am cut off)' },
  { id: '4-5 days', label: '4–5 days' },
  { id: '8-10 days', label: '8–10 days' },
  { id: '11 days or longer', label: '11 days or longer' },
]

export const USE_CASES = [
  { id: 'Company Uniforms',      label: 'Company Uniforms' },
  { id: 'Sports & Teamwear',     label: 'Sports & Teamwear' },
  { id: 'Events & Promotions',   label: 'Events & Promotions' },
  { id: 'Charity & Fundraising', label: 'Charity & Fundraising' },
  { id: 'School & Education',    label: 'School & Education' },
  { id: 'Retail & Merchandise',  label: 'Retail & Merchandise' },
]

export const GENDER_OPTIONS = [
  { id: 'Mens',   label: 'Mens' },
  { id: 'Womens', label: 'Womens' },
  { id: 'Kids',   label: 'Kids' },
  { id: 'Unisex', label: 'Unisex' },
]

export const FABRIC_OPTIONS = [
  { id: 'Cotton',       label: 'Cotton' },
  { id: 'Polyester',    label: 'Polyester' },
  { id: 'Poly-cotton',  label: 'Poly-Cotton Mix' },
]

export const WEIGHT_OPTIONS = [
  { id: 'Lightweight',  label: 'Lightweight' },
  { id: 'Mediumweight', label: 'Mediumweight' },
  { id: 'Heavyweight',  label: 'Heavyweight' },
]

export const FIT_OPTIONS = [
  { id: 'Regular', label: 'Regular' },
  { id: 'Slim',    label: 'Slim Fit' },
]

export const PRIORITIES = [
  { id: 'Lowest price', label: 'Lowest price', desc: 'Cheapest options first' },
  { id: 'Balanced',     label: 'Balanced',     desc: 'Best value for money' },
  { id: 'Best quality', label: 'Best quality', desc: 'Top-tier premium products' },
]

export const DECORATION_TYPES = [
  { id: 'Printing',   label: 'Print', desc: 'Best for t-shirts, large logos, and higher volumes.' },
  { id: 'Embroidery', label: 'Embroidery',   desc: 'Premium look. Best for polos, hoodies, jackets.' },
]

// Service pricing (from Services rows in spreadsheet)
export const SERVICE_PRICING = {
  origination:  [{ qty: 1, price: 0 }],
  printing:     [{ qty: 1, price: 5.99 }, { qty: 10, price: 4.75 }, { qty: 35, price: 3.50 }, { qty: 100, price: 2.99 }, { qty: 250, price: 2.25 }, { qty: 500, price: 2.25 }],
  embroidery:   [{ qty: 1, price: 6.99 }, { qty: 10, price: 5.49 }, { qty: 35, price: 4.25 }, { qty: 100, price: 3.75 }, { qty: 250, price: 2.75 }, { qty: 500, price: 2.75 }],
} as const

export const FAQ_CHIPS = [
  'Minimum orders', 'Delivery times', 'Logo file formats',
  'Colour matching', 'Returns policy', 'Rush orders',
]

export const LOGO_POSITIONS = [
  { id: 'left-chest',   label: 'Left Chest' },
  { id: 'right-chest',  label: 'Right Chest' },
  { id: 'centre-chest', label: 'Centre Chest' },
  { id: 'full-front',   label: 'Full Front' },
  { id: 'left-sleeve',  label: 'Left Sleeve' },
  { id: 'back-centre',  label: 'Back (Centre)' },
  { id: 'back-top',     label: 'Back (Top)' },
]

export const LOGO_STATUS = [
  { id: 'new-artwork',     label: 'New logo',      desc: 'I have artwork ready' },
  { id: 'existing-logo',   label: 'Existing logo', desc: 'Use our current artwork' },
]

export const ADVICE_CHIPS = [
  'Best for school sports day',
  'Smart look for office team',
  'Budget event giveaway',
  'Premium retail merchandise',
]
