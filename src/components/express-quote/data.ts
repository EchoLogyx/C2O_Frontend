// ─── Colour palette ───────────────────────────────────────────────
export const NAVY      = '#4A90E2'
export const NAVY_DARK = '#1e3a5f'
export const NAVY_LIGHT= '#bfdbfe'
export const GOLD      = '#d4a574'
export const INK       = '#111827'
export const MUTED     = '#6b7280'
export const BORDER    = '#e5e7eb'
export const GREY_BG   = '#f8fafc'
export const GREEN     = '#16a34a'
export const AMBER     = '#d97706'

// ─── Products ─────────────────────────────────────────────────────
export const PRODUCT_TYPES = [
  { id: 'tshirts',  label: 'T-Shirts',    emoji: '👕', desc: 'Classic & performance' },
  { id: 'polo',     label: 'Polo Shirts', emoji: '🎽', desc: 'Smart casual' },
  { id: 'hoodies',  label: 'Hoodies',     emoji: '🧥', desc: 'Cosy & premium' },
  { id: 'jackets',  label: 'Jackets',     emoji: '🧣', desc: 'Outerwear & fleece' },
]

export const PRODUCTS: Record<string, Array<{ id: string; name: string; fabric: string }>> = {
  tshirts: [
    { id: 'gildan5000',  name: 'Gildan 5000',          fabric: '180gsm Cotton' },
    { id: 'fotl3930',    name: 'FOTL 3930R',            fabric: '165gsm Cotton' },
    { id: 'bc3001',      name: 'Bella+Canvas 3001',     fabric: '145gsm Airlume' },
    { id: 'as_staple',   name: 'AS Colour Staple',      fabric: '180gsm Cotton' },
    { id: 'hanes_beefy', name: "Hanes Beefy-T",         fabric: '215gsm Cotton' },
    { id: 'cc1717',      name: 'Comfort Colors 1717',   fabric: '230gsm Ring-spun' },
    { id: 'nl3600',      name: 'Next Level 3600',       fabric: '130gsm Cotton' },
    { id: 'awdis_cool',  name: 'AWDis Core Cool',       fabric: '140gsm Polyester' },
    { id: 'cont_n03',    name: 'Continental N03',        fabric: '155gsm Organic' },
    { id: 'bb_bg150',    name: 'BagBase BG150',          fabric: '190gsm Cotton' },
  ],
  polo: [
    { id: 'fotl63218',   name: 'FOTL 63-218',           fabric: '200gsm Piqué' },
    { id: 'kk101',       name: 'Kustom Kit KK101',      fabric: '200gsm Piqué' },
    { id: 'bc_mypolo',   name: 'B&C My Polo',            fabric: '180gsm Cotton' },
    { id: 'gildan64800', name: 'Gildan 64800',           fabric: '170gsm Piqué' },
    { id: 'awdis_polo',  name: 'AWDis Academy Polo',    fabric: '160gsm Polyester' },
    { id: 'result_r228', name: 'Result Core R228X',     fabric: '210gsm Cotton' },
    { id: 'jerzees_dri', name: 'Jerzees Dri-Power',     fabric: '185gsm Blend' },
    { id: 'henbury_h100',name: 'Henbury HB100',          fabric: '180gsm Piqué' },
  ],
  hoodies: [
    { id: 'gildan18500', name: 'Gildan 18500',          fabric: '280gsm Blend' },
    { id: 'fotl62208',   name: 'FOTL 62-208',           fabric: '280gsm Blend' },
    { id: 'as_premium',  name: 'AS Colour Premium Hood', fabric: '350gsm Cotton' },
    { id: 'awdis_hood',  name: 'AWDis Academy Hood',    fabric: '280gsm Polyester' },
    { id: 'hanes_p170',  name: 'Hanes P170',            fabric: '280gsm Blend' },
    { id: 'cont_n51p',   name: 'Continental N51P',       fabric: '300gsm Organic' },
    { id: 'bc3719',      name: 'Bella+Canvas 3719',      fabric: '240gsm Fleece' },
    { id: 'cc1566',      name: 'Comfort Colors 1566',   fabric: '340gsm Cotton' },
    { id: 'ind_ss4500z', name: 'Independent SS4500Z',   fabric: '320gsm Blend' },
    { id: 'ss_stsu812',  name: 'Stanley/Stella STSU812', fabric: '300gsm Organic' },
  ],
  jackets: [
    { id: 'result_r120', name: 'Result Core R120X',     fabric: 'Softshell' },
    { id: 'uneek_uc620', name: 'Uneek UC620',           fabric: 'Microfleece' },
    { id: 'pa_j317',     name: 'Port Authority J317',   fabric: 'Softshell' },
    { id: 'reg_tra300',  name: 'Regatta TRA300',         fabric: 'Waterproof' },
    { id: 'storm_tbx1',  name: 'Stormtech TBX-1',       fabric: 'Insulated' },
    { id: 'awdis_micro', name: 'AWDis Micro Fleece',     fabric: 'Microfleece' },
    { id: 'kar_k6118',   name: 'Kariban K6118',          fabric: 'Softshell' },
    { id: 'hen_hb827',   name: 'Henbury HB827',          fabric: 'Fleece' },
  ],
}

export const USE_CASES = [
  { id: 'uniforms',   label: 'Company Uniforms',      emoji: '🏢' },
  { id: 'sports',     label: 'Sports & Teamwear',     emoji: '⚽' },
  { id: 'events',     label: 'Events & Promotions',   emoji: '🎉' },
  { id: 'charity',    label: 'Charity & Fundraising', emoji: '❤️' },
  { id: 'schools',    label: 'Schools & Education',   emoji: '🎓' },
  { id: 'retail',     label: 'Retail & Merchandise',  emoji: '🛍️' },
]

export const PRIORITIES = [
  { id: 'speed',   label: 'Speed',   emoji: '⚡', desc: 'Need it fast' },
  { id: 'balance', label: 'Balance', emoji: '⚖️', desc: 'Best value' },
  { id: 'quality', label: 'Quality', emoji: '💎', desc: 'Best quality' },
]

export const PLACEMENTS = [
  { id: 'front_chest', label: 'Front Chest' },
  { id: 'back',        label: 'Back' },
  { id: 'left_chest',  label: 'Left Chest' },
  { id: 'sleeve',      label: 'Sleeve' },
  { id: 'hood_pocket', label: 'Hood / Pocket' },
]

export const METHODS = [
  { id: 'embroidery',  label: 'Embroidery',     emoji: '🧵', desc: 'Premium textured finish' },
  { id: 'print',       label: 'Screen Print',   emoji: '🖨️', desc: 'Vivid flat colour' },
  { id: 'heat',        label: 'Heat Transfer',  emoji: '🔥', desc: 'Photo-quality images' },
  { id: 'vinyl',       label: 'Vinyl Cut',      emoji: '✂️', desc: 'Sharp lines & text' },
]

export const LOGO_STATUS = [
  { id: 'ready',    label: 'Ready to go',       emoji: '✅', desc: 'I have print-ready files' },
  { id: 'design',   label: 'Need design help',  emoji: '🎨', desc: 'I need artwork support' },
  { id: 'explore',  label: 'Just exploring',    emoji: '🔍', desc: 'Still early stage' },
]

export const DEADLINE_OPTIONS = [
  { id: 'asap',     label: 'ASAP (3–5 days)' },
  { id: 'week2',    label: 'Within 2 weeks' },
  { id: 'month',    label: 'Within a month' },
  { id: 'flexible', label: "I'm flexible" },
]

// ─── Tier config ──────────────────────────────────────────────────
export const TIERS = [
  { id: 'budget',   name: 'Budget',   emoji: '🌱', color: '#64748b', badge: '',          baseUnit: 3.50,  setup: 15,  delivery: '5–7 days' },
  { id: 'everyday', name: 'Everyday', emoji: '⭐', color: NAVY,      badge: 'POPULAR',   baseUnit: 5.20,  setup: 25,  delivery: '3–5 days' },
  { id: 'premium',  name: 'Premium',  emoji: '💫', color: '#7c3aed', badge: '',          baseUnit: 7.80,  setup: 35,  delivery: '3–4 days' },
  { id: 'retail',   name: 'Retail',   emoji: '🏆', color: AMBER,     badge: '',          baseUnit: 11.50, setup: 45,  delivery: '2–3 days' },
  { id: 'designer', name: 'Designer', emoji: '✨', color: '#dc2626', badge: 'LUXURY',    baseUnit: 18.00, setup: 65,  delivery: '5–7 days' },
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
