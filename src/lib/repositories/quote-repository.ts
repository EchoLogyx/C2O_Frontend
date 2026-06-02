import { Quote, QuoteStatus } from "@/types";
import quotesData from "@/data/quotes.json";

export interface IQuoteRepository {
  getAll(): Promise<Quote[]>;
  getById(id: string): Promise<Quote | undefined>;
  getByStatus(status: QuoteStatus): Promise<Quote[]>;
  updateStatus(id: string, status: QuoteStatus): Promise<Quote>;
  search(query: string): Promise<Quote[]>;
}

class QuoteRepository implements IQuoteRepository {
  private quotes: Quote[] = quotesData as Quote[];

  async getAll(): Promise<Quote[]> {
    return [...this.quotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getById(id: string): Promise<Quote | undefined> {
    return this.quotes.find((q) => q.id === id);
  }

  async getByStatus(status: QuoteStatus): Promise<Quote[]> {
    return this.quotes.filter((q) => q.status === status);
  }

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const index = this.quotes.findIndex((q) => q.id === id);
    if (index === -1) throw new Error(`Quote ${id} not found`);
    this.quotes[index] = {
      ...this.quotes[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return this.quotes[index];
  }

  async search(query: string): Promise<Quote[]> {
    const q = query.toLowerCase();
    return this.quotes.filter(
      (quote) =>
        quote.customerName.toLowerCase().includes(q) ||
        quote.quoteNumber.toLowerCase().includes(q) ||
        quote.product.toLowerCase().includes(q)
    );
  }
}

export const quoteRepository = new QuoteRepository();
