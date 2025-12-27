import { fetchTokenBalances } from "@/lib/balances"
import { CHAINS_LIST, getTokensForChain } from "@/lib/registry"

export const revalidate = 60 // Stale for 60 seconds

export const GET = async (request: Request) => {
  const params = new URL(request.url).searchParams
  const evmWallet = params.get("evm")
  const solanaWallet = params.get("sol")
  const fuelWallet = params.get("fuel")

  const wallets = {
    EVM: evmWallet,
    SOLANA: solanaWallet,
    FUEL: fuelWallet,
  }

  const allBalances = await Promise.all(
    CHAINS_LIST.filter((chain) => wallets[chain.chainType]).map(
      async (chain) => {
        const tokens = getTokensForChain(chain.id)
        const balances = await fetchTokenBalances(
          chain,
          wallets[chain.chainType]!,
          tokens.map(({ symbol, chains }) => {
            const chainData = (chains as any)[chain.id]
            return {
              ...chainData,
              symbol,
            }
          })
        )

        return {
          chainId: chain.id,
          balances: balances.map((b) => ({
            ...b,
            balance: b.balance.toString(),
          })),
        }
      }
    )
  )

  return Response.json(
    {
      balances: allBalances.reduce(
        (acc, { chainId, balances }) => ({ ...acc, [chainId]: balances }),
        {}
      ),
      wallet: wallets,
    },
    {
      headers: {
        "Cache-Control": `public, max-age=${revalidate}`,
      },
    }
  )
}
