"use client"

import type { BalanceResult } from "./balances"
import useSWR from "swr"

import { type DepositChain, getTokensForChain, TOKENS } from "./registry"
import { jsonify } from "./utils"
import { useSentientWallet } from "./wallets"

// Chain specific token lists
const SOL_TOKENS = [TOKENS.SOL.chains.SOLANA!]
const FUEL_TOKENS = [TOKENS.FUEL.chains.FUEL!]

// Op holds all evm related tokens (USDC, USDT, WLD, w/ETH)
const OP_TOKENS = getTokensForChain("OPTIMISM")
  .map((t) => t.chains.OPTIMISM!)
  .flat()

const ALL_ADDRESSES = {
  OP: OP_TOKENS.map((t) => `optimism:${t.address}`).join(","),
  SOL: SOL_TOKENS.map((t) => `solana:${t.address}`).join(","),
  FUEL: FUEL_TOKENS.map((t) => `fuel:${t.address}`).join(","),
}

export const useTokenPrices = () => {
  const { data: pricefeed = null } = useSWR(
    `all.token.prices`,
    async () => {
      const coins = Object.values(ALL_ADDRESSES).filter(Boolean).join(",")
      const data = await jsonify<{
        coins: Record<
          string,
          {
            decimals: number
            price: number
            symbol: string
            timestamp: number
            confidence: number
          }
        >
      }>(fetch(`https://coins.llama.fi/prices/current/${coins}`))

      return data?.coins || {}
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      refreshInterval: 3 * 60 * 1000, // Refresh every 3 minutes
    }
  )

  const getTokenPrice = (symbol: string) => {
    let SYMBOL = symbol.toUpperCase()
    // Use WETH price for ETH
    if (symbol === "ETH") SYMBOL = "WETH"

    const tokenEntry = Object.values(pricefeed || {}).find(
      (t) => t.symbol === SYMBOL
    )

    return tokenEntry?.price || 0
  }

  return { pricefeed, getTokenPrice }
}

/**
 * Fetches account balances across multiple chains
 * @param opts If provided, fetch balances for specific addresses
 */
export const useAccountBalances = (opts?: {
  sol?: string
  fuel?: string
  evm?: string
}) => {
  const { wallet } = useSentientWallet()

  const EVM = opts?.evm || wallet?.evm?.address
  const SOL = opts?.sol || wallet?.solana?.address
  const FUEL = opts?.fuel || wallet?.fuel?.address

  const params = new URLSearchParams()
  if (EVM) params.set("evm", EVM)
  if (SOL) params.set("sol", SOL)
  if (FUEL) params.set("fuel", FUEL)

  const KEY = params.toString()
  const { data, ...query } = useSWR(
    KEY ? `/api/balances?${KEY}` : null,
    async (url) =>
      await jsonify<{
        balances: Record<DepositChain, BalanceResult[]>
      }>(fetch(url)),
    {
      refreshInterval: 50_000, // Refresh every 50s
      revalidateOnFocus: false,
    }
  )

  const { getTokenPrice } = useTokenPrices()
  const balances = data?.balances || null

  // Flatten all balances with chain info
  const priceFormattedBalances = Object.entries(balances || {})
    .flatMap(([chainId, chainBalances]) =>
      chainBalances.map((balance) => {
        const symbol = balance.symbol || ""
        const usdPrice = symbol ? getTokenPrice(symbol) : 0
        return {
          ...balance,
          symbol,
          chainId,
          usdValue: Number(balance.formattedBalance) * usdPrice,
        }
      })
    )
    .filter((b) => Boolean(b.symbol))

  return {
    balances,
    priceFormattedBalances,
    ...query,
  }
}
