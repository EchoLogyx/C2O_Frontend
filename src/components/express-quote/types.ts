export type ViewMode = 'home' | 'quote' | 'faq' | 'advice' | 'chat' | 'order'

export interface Message {
  id: string
  role: 'morgan' | 'user' | 'human'
  text: string
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
