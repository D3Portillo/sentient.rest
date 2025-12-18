import type { NextRequest } from "next/server"

export interface MetamaskQuoteResponse {
  success: Array<{
    provider: string
    quote: {
      crypto: {
        id: string
        idv2: string
        legacyId: string
        logo: string
        decimals: number
        address: string
        symbol: string
        name: string
      }
      cryptoId: string
      fiatId: string
      amountIn: 50
      amountOut: number
      exchangeRate: number
      networkFee: number
      providerFee: number
      extraFee: number
      receiver: string
    }
    nativeApplePay: { supported: boolean }
    providerInfo: {
      id: string
      name: string
      logos: {
        light: string
        dark: string
      }
    }
    metadata: { reliability: number; tags: { isMostReliable: boolean } }
  }>
}
export async function GET(request: NextRequest) {
  const params = new URLSearchParams(request.nextUrl.search)

  const amout = params.get("amount")
  const address = params.get("address")
  const regionCode = params.get("region") // e.g., "us-ca"

  if ([amout, address, regionCode].some((v) => !v)) {
    return Response.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    )
  }

  const QUOTE_URL = `https://on-ramp.api.cx.metamask.io/providers/all/quote?regionId=%2Fregions%2F${regionCode}&cryptoCurrencyId=%2Fcurrencies%2Fcrypto%2F8453%2F0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&fiatCurrencyId=%2Fcurrencies%2Ffiat%2Fusd&amount=${amout}&paymentMethodId%5B0%5D=%2Fpayments%2Fdebit-credit-card&walletAddress=${address}&sdk=2.1.11&context=browser&keys=`
  const res = await fetch(QUOTE_URL, {
    headers: {
      accept: "application/json, text/plain, */*",
      Host: "metamask.io",
    },
  })

  return Response.json(await res.json())
}
