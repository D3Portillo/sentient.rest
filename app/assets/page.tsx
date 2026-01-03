"use client"

import Link from "next/link"
import { useState } from "react"

import { getTokenBySymbol, type TokenConfig } from "@/lib/registry"
import { useSentientWallet } from "@/lib/wallets"
import { useTokenPrices, useAccountBalances } from "@/lib/prices"

import { Spinner } from "@/components/icons"
import { localizeNumber } from "@/lib/numbers"
import { useBalancesModal } from "@/components/DrawerBalances"

import { FaCheck } from "react-icons/fa6"
import { IoArrowBackSharp } from "react-icons/io5"
import PageContainer from "@/app/PageContainer"

export default function PageAssets() {
  const { openModal } = useBalancesModal()

  const [showZeroBalances, setShowZeroBalances] = useState(false)
  const { wallet } = useSentientWallet()

  const { priceFormattedBalances } = useAccountBalances({
    evm: wallet?.evm.address,
    sol: wallet?.solana.address,
    fuel: wallet?.fuel.address,
  })

  // Group balances by token symbol
  const grouped = Object.groupBy(priceFormattedBalances, ({ symbol }) => symbol)

  const groupedWithTotals = Object.entries(grouped)
    .map(([symbol, assets = []]) => ({
      symbol,
      totalBalance: assets.reduce(
        (sum, a) => sum + Number(a.formattedBalance),
        0
      ),
      totalUsdValue: assets.reduce((sum, a) => sum + a.usdValue, 0),
    }))
    // Sort by USD value descending
    .sort((a, b) => b.totalUsdValue - a.totalUsdValue)

  // Filter zero balances (if applicable)
  const displayAssets = showZeroBalances
    ? groupedWithTotals
    : groupedWithTotals.filter((a) => a.totalUsdValue > 0)

  const accountBalance = displayAssets.reduce(
    (acc, { totalUsdValue: current }) => acc + current,
    0
  )

  return (
    <PageContainer>
      {/* Title */}
      <nav className="flex items-center gap-2">
        <Link className="text-2xl active:scale-95" href="/">
          <IoArrowBackSharp />
        </Link>
        <h1 className="text-2xl font-bold">Assets</h1>
      </nav>

      {/* Header */}
      <div className="flex mt-4 items-end justify-between">
        <div>
          <p className="text-white/80 text-xs">Total Balance</p>
          <p className="text-xl font-bold">${localizeNumber(accountBalance)}</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative grid place-items-center size-4 rounded border border-white/20 bg-white/5 has-checked:bg-white/15">
            <input
              type="checkbox"
              checked={showZeroBalances}
              className="absolute opacity-0 inset-0"
              onChange={(e) => setShowZeroBalances(e.target.checked)}
            />

            {showZeroBalances && <FaCheck className="text-xs" />}
          </div>
          <span className="text-sm text-white/80">Show Zero Balances</span>
        </label>
      </div>

      {/* Assets List */}
      <div className="flex mt-4 mb-12 flex-col gap-2">
        {displayAssets.length ? (
          displayAssets.map((asset) => (
            <AssetRow
              key={`asset-${asset.symbol}`}
              onSelect={() => openModal(asset.symbol as any)}
              token={getTokenBySymbol(asset.symbol as any)!}
              formattedBalance={asset.totalBalance.toFixed(4)}
              usdValue={asset.totalUsdValue}
            />
          ))
        ) : (
          <div className="grid place-items-center">
            <Spinner />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function AssetRow({
  token,
  formattedBalance,
  usdValue,
  onSelect,
}: {
  token: TokenConfig
  formattedBalance: string
  usdValue: number
  onSelect?: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-4 p-4 pr-5 rounded-xl bg-white/5 hover:bg-white/8 transition-colors border border-white/5"
    >
      <figure className="size-9 rounded-full overflow-hidden bg-gray-300">
        <img src={token.iconImage} className="size-full object-cover" alt="" />
      </figure>

      <div className="flex-1 text-left">
        <div className="font-semibold">{token.symbol}</div>
        <div className="text-xs text-white/60">{token.name}</div>
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
