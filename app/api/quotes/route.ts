import { generateJWT } from "@/lib/session"

export interface OnrampSessionRequest {
  purchaseCurrency: "USDC" | "USDT" | "ETH"
  destinationNetwork: "base"
  destinationAddress: string
  paymentAmount?: string
  paymentCurrency?: "USD"
  paymentMethod?: "CARD"
  country?: string
  subdivision?: string
  redirectUrl?: string
  clientIp?: string
  partnerUserRef?: string
}

export async function POST(request: Request) {
  const { path, headers } = await generateJWT(
    "https://api.cdp.coinbase.com/platform/v2/onramp/sessions"
  )

  const req = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(await request.json()),
  })

  return Response.json(await req.json())
}
