import { Chain, createPublicClient, erc20Abi, formatUnits, http } from "viem"
import { Provider } from "fuels"
import { address, createSolanaRpc } from "@solana/kit"

import { ZERO } from "./constants"

type BalanceResult = {
  address: string
  decimals: number
  balance: bigint
  formattedBalance: string
}

export type ChainType = "EVM" | "SOLANA" | "FUEL"

export const fetchTokenBalances = async (
  rpcData: {
    chainType: ChainType
    rpcURL: string
    chainConfig?: Chain | null
  },
  ownerAddress: string,
  tokens: { address: string; symbol?: string; decimals: number }[]
): Promise<BalanceResult[]> => {
  if (rpcData.chainType === "EVM") {
    const client = createPublicClient({
      chain: rpcData.chainConfig ?? undefined,
      transport: http(rpcData.rpcURL),
    })

    const result = await client.multicall({
      contracts: tokens.map((token) => ({
        address: token.address as any,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [ownerAddress],
      })),
    })

    return tokens.map(({ address, decimals }, index) => {
      const balance = BigInt(result[index]?.result || ZERO)
      return {
        address,
        decimals,
        balance,
        formattedBalance: formatUnits(balance, decimals),
      }
    }) as BalanceResult[]
  }

  if (rpcData.chainType === "SOLANA") {
    const rpc = createSolanaRpc(rpcData.rpcURL)
    const owner = address(ownerAddress)

    return await Promise.all(
      tokens.map(async ({ address: tokenAddress, decimals }) => {
        const USDC_MINT = address("EPjFWdd5AufqSSqeM2q9GQ6r6tZL1k5Y2dZ9iYkX2x5")

        const res = await rpc
          .getTokenAccountsByOwner(
            owner,
            {
              mint: USDC_MINT,
            },
            {
              encoding: "jsonParsed",
            }
          )
          .send()

        const result =
          res?.value?.at(0)?.account?.data?.parsed?.info?.tokenAmount?.amount

        const balance = BigInt(result || ZERO)
        return {
          address: tokenAddress,
          formattedBalance: formatUnits(balance, decimals),
          decimals,
          balance,
        } satisfies BalanceResult
      })
    )
  }

  const fuelProvider = new Provider(rpcData.rpcURL)

  // Else we assume FUEL
  return await Promise.all(
    tokens.map(async ({ address, decimals }) => {
      const balance = await fuelProvider.getBalance(ownerAddress, address)
      const balanceBigInt = BigInt(balance.toString())
      return {
        address,
        decimals,
        balance: balanceBigInt,
        formattedBalance: formatUnits(balanceBigInt, decimals),
      } satisfies BalanceResult
    })
  )
}
