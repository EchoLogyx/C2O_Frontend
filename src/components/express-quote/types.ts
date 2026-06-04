export type ViewMode = 'home' | 'quote' | 'faq' | 'advice' | 'chat' | 'order'

export interface Message {
  id: string
  role: 'morgan' | 'user' | 'human'
  text: string
  step?: number
}

export interface QuoteAnswers {
  useCase?: string
  qty?: number
  priority?: string
  productType?: string
  product?: string
  placement?: string
  method?: string
  logoStatus?: string
  deadline?: string
}

export interface TierResult {
  id: string
  name: string
  emoji: string
  unitPrice: number
  setupFee: number
  totalPrice: number
  delivery: string
  moq: number
  badge?: string
  color: string
}

export interface ProductItem {
  id: string
  name: string
  type: 'tshirts' | 'polo' | 'hoodies' | 'jackets'
  fabric: string
}
