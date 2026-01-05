"use client"

import { atom, useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"

import {
  type DepositToken,
  getChainsForToken,
  getTokenBySymbol,
} from "@/lib/registry"
import { cn } from "@/lib/utils"
import { localizeNumber } from "@/lib/numbers"
import { useAccountBalances } from "@/lib/prices"

import { TbArrowUpRight, TbArrowDownLeft } from "react-icons/tb"

import { useWithdrawModal } from "./DrawerWithdraw"
import { useDepositModal } from "./DrawerDeposit"
import Button from "./Button"

const atomBalanceModal = atom({
  assetSymbol: null as DepositToken | null,
})

export const useBalancesModal = () => {
  const [{ assetSymbol }, setBalanceModal] = useAtom(atomBalanceModal)

  return {
    assetSymbol,
    isOpen: assetSymbol !== null,
    openModal: (assetSymbol: DepositToken) => setBalanceModal({ assetSymbol }),
    close: () => setBalanceModal({ assetSymbol: null }),
  }
}

export default function DrawerBalances() {
  const { show: showWithdrawModal } = useWithdrawModal()
  const { show: showDepositModal } = useDepositModal()

  const { isOpen, close: closeBalancesModal, assetSymbol } = useBalancesModal()
  const { priceFormattedBalances } = useAccountBalances()

  const chainsForToken = assetSymbol ? getChainsForToken(assetSymbol) : []

  const chainsWithBalances = chainsForToken
    .map((chain) => {
      const balances =
        priceFormattedBalances.find(
          (b) => b.chainId === chain.id && b.symbol === assetSymbol
        ) || null

      return {
        ...chain,
        balances: {
          usdValue: balances?.usdValue || 0,
          formattedBalance: balances?.formattedBalance || "0",
        },
      }
    })
    .sort(({ balances: a }, { balances: b }) => b.usdValue - a.usdValue)

  return (
    <Drawer open={isOpen} onOpenChange={closeBalancesModal}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Chain Balances ({assetSymbol})</DrawerTitle>
        </DrawerHeader>

        <section className="mt-2 px-2 grow">
          {chainsWithBalances.map(({ balances, ...chain }) => {
            const TOKEN_CONFIG = getTokenBySymbol(assetSymbol!) || undefined

            return (
              <div
                key={`balance-by-chain-${chain.id}`}
                className={cn(
                  "first:border-t border-white/10",
                  "border-b last:border-b-0",
                  "flex gap-4 justify-between items-center pr-4 py-3"
                )}
              >
                <div className="flex items-center gap-4">
                  <figure className="size-7 bg-white/15 border border-white/5 rounded-md overflow-hidden">
                    <img
                      src={chain.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>

                  <div className="min-w-28">
                    <div className="font-semibold">{chain.name}</div>
                    <div className="text-xs text-white/60">
                      {balances?.formattedBalance || "0"} {assetSymbol}
                    </div>
                  </div>
                </div>

                <nav className="flex grow gap-2 items-center">
                  <button
                    onClick={() =>
                      showWithdrawModal({
                        chain,
                        token: TOKEN_CONFIG,
                      })
                    }
                    className="active:scale-98 bg-linear-to-bl from-white/15 to-white/7 border border-white/10 size-8 text-xl rounded-md grid place-items-center"
                  >
                    <TbArrowUpRight />
                  </button>

                  <button
                    onClick={() =>
                      showDepositModal({
                        chain,
                        token: TOKEN_CONFIG,
                      })
                    }
                    className="active:scale-98 border border-white/15 size-8 text-xl rounded-md grid place-items-center"
                  >
                    <TbArrowDownLeft />
                  </button>
                </nav>

                <div className="font-bold text-right">
                  ${localizeNumber(balances?.usdValue || 0)}
                </div>
              </div>
            )
          })}
        </section>

        <div className="p-4">
          <Button onClick={closeBalancesModal} className="w-full">
            Back to Assets
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
