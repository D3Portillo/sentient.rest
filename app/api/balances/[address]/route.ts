import { fetchTokenBalances } from "@/lib/balances"
import { CHAINS_LIST, getTokensForChain } from "@/lib/registry"

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) => {
  const { address } = await params
  const chainType = new URL(request.url).searchParams.get("chainType")

  const balances = await Promise.all(
    CHAINS_LIST.filter((chain) => chain.chainType === chainType).map(
      async (chain) => {
        const chainId = chain.id
        const tokens = getTokensForChain(chainId)
        const balances = await fetchTokenBalances(
          chain,
          address,
          tokens.map((t) => {
            const chains = t.chains as any
            return {
              address: chains[chainId].address,
              decimals: chains[chainId].decimals,
            }
          })
        )

        return {
          chain: chainId,
          balances: balances.map((b) => ({
            ...b,
            balance: b.balance.toString(),
          })),
        }
      }
    )
  )

  return Response.json(balances)
}
