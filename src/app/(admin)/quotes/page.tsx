import { quoteRepository } from "@/lib/repositories/quote-repository"
import { QuotesClient } from "@/components/quotes/quotes-client"

export default async function QuotesPage() {
  const quotes = await quoteRepository.getAll()
  return <QuotesClient initialQuotes={quotes} />
}
