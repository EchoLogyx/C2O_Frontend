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
  purpose?: string
  qty?: number
  priority?: 'Speed' | 'Balance' | 'Quality'
  category?: string        // "t-shirts" | "polo-shirts" | "hoodies" | "jackets"
  decorationType?: 'Printing' | 'Embroidery'
  logoPosition?: string    // matches availablePositions key e.g. "5. Left Chest"
  logoStatus?: string
  deadline?: string        // "asap" | "week2" | "month" | "flexible"
}
