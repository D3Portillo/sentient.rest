"use client"

import { atom, useAtom } from "jotai"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"

import { type DepositToken, getChainsForToken } from "@/lib/registry"
import { localizeNumber } from "@/lib/numbers"
import { useAccountBalances } from "@/lib/prices"
import { useSentientWallet } from "@/lib/wallets"
import Button from "./Button"
import { cn } from "../lib/utils"

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
  const { wallet } = useSentientWallet()

  const { isOpen, close, assetSymbol } = useBalancesModal()
  const { priceFormattedBalances } = useAccountBalances({
    evm: wallet?.evm.address,
    sol: wallet?.solana.address,
    fuel: wallet?.fuel.address,
  })

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
    <Drawer open={isOpen} onOpenChange={close}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Chain Balances ({assetSymbol})</DrawerTitle>
        </DrawerHeader>

        <section className="mt-2 grow">
          {chainsWithBalances.map(({ balances, ...chain }) => {
            return (
              <div
                key={`balance-by-chain-${chain.id}`}
                className={cn(
                  "first:border-t border-white/10",
                  "border-b last:border-b-0",
                  "flex justify-between items-center pr-4 py-3"
                )}
              >
                <nav className="flex items-center gap-4">
                  <figure className="size-7 bg-white/15 border border-white/5 rounded-md overflow-hidden">
                    <img
                      src={chain.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>

                  <div>
                    <div className="font-semibold">{chain.name}</div>
                    <div className="text-sm text-white/60">
                      {balances?.formattedBalance || "0"} {assetSymbol}
                    </div>
                  </div>
                </nav>

                <div className="font-bold">
                  ${localizeNumber(balances?.usdValue || 0)}
                </div>
              </div>
            )
          })}
        </section>

        <div className="p-4">
          <Button className="w-full">Back to Assets</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
