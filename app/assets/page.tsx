"use client"

import { useState } from "react"
import { useSentientWallet } from "@/lib/wallets"
import { useTokenPrices, useAccountBalances } from "@/lib/prices"

import { Spinner } from "@/components/icons"
import PageContainer from "@/app/PageContainer"
import { localizeNumber } from "@/lib/numbers"

export default function PageAssets() {
  const [showZeroBalances, setShowZeroBalances] = useState(false)
  const { wallet } = useSentientWallet()

  const { balances } = useAccountBalances({
    evm: wallet?.evm.address,
    sol: wallet?.solana.address,
    fuel: wallet?.fuel.address,
  })

  const { getTokenPrice } = useTokenPrices()

  // Flatten all balances with chain info
  const allAssets = Object.entries(balances || {}).flatMap(
    ([chainId, chainBalances]) =>
      chainBalances.map((balance) => ({
        ...balance,
        chainId,
        usdValue:
          getTokenPrice(balance.symbol || "") *
          Number(balance.formattedBalance),
      }))
  )

  // Filter zero balances if needed
  const displayAssets = showZeroBalances
    ? allAssets
    : allAssets.filter((a) => a.usdValue > 0)

  // Sort by USD value
  displayAssets.sort((a, b) => b.usdValue - a.usdValue)

  const totalUSD = allAssets.reduce((acc, a) => acc + a.usdValue, 0)

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assets</h1>
            <p className="text-white/60 text-sm">
              Total: ${localizeNumber(totalUSD)}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showZeroBalances}
              onChange={(e) => setShowZeroBalances(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-sw-yellow checked:border-sw-yellow"
            />
            <span className="text-sm text-white/80">Show Zero Balances</span>
          </label>
        </div>

        {/* Assets List */}
        <div className="flex mb-12 flex-col gap-2">
          {displayAssets.length === 0 ? (
            <div className="grid place-items-center">
              <Spinner />
            </div>
          ) : (
            displayAssets.map((asset, idx) => (
              <AssetRow
                key={`asset-${asset.chainId}-${asset.address}-${idx}`}
                {...asset}
              />
            ))
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function AssetRow({
  symbol,
  formattedBalance,
  usdValue,
  chainId,
}: {
  symbol?: string
  formattedBalance: string
  usdValue: number
  chainId: string
}) {
  const chainName = chainId.charAt(0) + chainId.slice(1).toLowerCase()

  return (
    <button className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-white/5">
      <div className="w-10 h-10 rounded-full bg-white/10 grid place-items-center font-bold text-lg">
        {symbol?.charAt(0) || "?"}
      </div>

      <div className="flex-1 text-left">
        <div className="font-semibold">{symbol || "Unknown"}</div>
        <div className="text-xs text-white/60">{chainName}</div>
      </div>

      <div className="text-right">
        <div className="font-semibold">${localizeNumber(usdValue)}</div>
        <div className="text-xs text-white/60">
          {Number(formattedBalance).toFixed(4)}
        </div>
      </div>
    </button>
  )
}
