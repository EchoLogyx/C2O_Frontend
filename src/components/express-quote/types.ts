export type ViewMode = 'home' | 'quote' | 'faq' | 'advice' | 'chat' | 'order'

export interface ProductInfo {
  id: string
  name: string
  description: string
  price: number
  sku: string
  image_url: string
  category: string
  tags: string
  currency: string
  available: boolean
  url: string
}

export interface Message {
  id: string
  role: 'morgan' | 'user' | 'human'
  text: string
  products?: ProductInfo[]
  senderIcon?: string
}

export interface QuoteAnswers {
  speed?: string          // "Within 2 days" | "Within 5 days" | "Not urgent"
  purpose?: string        // maps to PURPOSE_MAP
  category?: string       // "t-shirts" | "polo-shirts" | "hoodies" | "jackets"
  gender?: string         // "Mens" | "Womens" | "Kids" | "Unisex"
  fabric?: string         // "Cotton" | "Polyester" | "Poly-cotton"
  weight?: string         // "Lightweight" | "Mediumweight" | "Heavyweight"
  fit?: string            // "Regular" | "Slim"
  qty?: number
  decorationType?: 'Printing' | 'Embroidery' | 'None'
  priority?: 'Lowest price' | 'Balanced' | 'Best quality'
  logoPosition?: string
  logoStatus?: string
}
