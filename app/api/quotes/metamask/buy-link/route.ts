export interface MetamaskQuoteLinkRequest {
  walletAddress: string
  region: string // e.g., "us-ca"
  amount: string // e.g., "100.00"
  provider:
    | "/providers/moonpay-b"
    | "/providers/binanceconnect"
    | "/providers/coinbase"
    | "/providers/ramp-network"
}

export type MetamaskBuyLinkResponse = {
  url: string
}

export async function POST(request: Request) {
  const body = await request.json()
  const { walletAddress, provider, region, amount } =
    body as Partial<MetamaskQuoteLinkRequest>

  if ([walletAddress, provider, region, amount].some((v) => !v)) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 }
    )
  }

  const QUOTE_URL = `https://on-ramp.api.cx.metamask.io${provider}/buy-widget?regionId=%2Fregions%2F${region}&paymentMethodId=%2Fpayments%2Fdebit-credit-card&cryptoCurrencyId=%2Fcurrencies%2Fcrypto%2F8453%2F0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&fiatCurrencyId=%2Fcurrencies%2Ffiat%2Fusd&amount=${amount}&walletAddress=${walletAddress}&redirectUrl=https%3A%2F%2Fportfolio.metamask.io&sdk=2.1.11&context=browser&keys=`
  const res = await fetch(QUOTE_URL, {
    headers: {
      accept: "application/json, text/plain, */*",
      Host: "metamask.io",
    },
  })

  return Response.json(await res.json())
}
