import type { Metadata } from "next"
import { ExpressQuoteWidget } from "@/components/express-quote/widget"

export const metadata: Metadata = {
  title: "C2O — Express Quote",
  description: "Get an instant clothing quote in under 2 minutes with Morgan, your Clothes2Order AI assistant.",
}

export default function HomePage() {
  return <ExpressQuoteWidget />
}
