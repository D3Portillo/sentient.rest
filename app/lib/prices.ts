"use client"

import type { BalanceResult } from "./balances"
import { type DepositChain, getTokensForChain, TOKENS } from "./registry"
import useSWR from "swr"
import { jsonify } from "./utils"

// Chain specific token lists
const SOL_TOKENS = [TOKENS.SOL.chains.SOLANA!]
const FUEL_TOKENS = [TOKENS.FUEL.chains.FUEL!]

// Op holds all evm related tokens (USDC, USDT, WLD, w/ETH)
const OP_TOKENS = getTokensForChain("OPTIMISM")
  .map((t) => t.chains.OPTIMISM!)
  .flat()

export const useTokenPrices = () => {
  const { data: pricefeed = null } = useSWR(`all.token.prices`, async () => {
    const opAddresses = OP_TOKENS.map((t) => `optimism:${t.address}`).join(",")
    const solAddresses = SOL_TOKENS.map((t) => `solana:${t.address}`).join(",")
    const fuelAddresses = FUEL_TOKENS.map((t) => `fuel:${t.address}`).join(",")

    const coins = [opAddresses, solAddresses, fuelAddresses]
      .filter(Boolean)
      .join(",")

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
  })

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

export const useAccountBalances = (opts: {
  sol?: string
  fuel?: string
  evm?: string
}) => {
  const params = new URLSearchParams()
  if (opts.evm) params.set("evm", opts.evm)
  if (opts.sol) params.set("sol", opts.sol)
  if (opts.fuel) params.set("fuel", opts.fuel)

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

  return {
    balances: data?.balances || null,
    ...query,
  }
}
