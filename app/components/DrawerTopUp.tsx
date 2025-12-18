"use client"

import type { MetamaskQuoteLinkRequest } from "@/app/api/quotes/metamask/buy-link/route"
import { useState, useEffect } from "react"
import { atom, useAtom } from "jotai"
import useSWR from "swr"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { useSentientWallet } from "@/lib/wallets"
import { getMiniAppActionLink } from "@/lib/world"
import { TOKEN_USDC } from "@/lib/registry"

import Button from "./Button"

const atomTopUpModalOpen = atom(false)
export const useTopUpModal = () => {
  const [open, setOpen] = useAtom(atomTopUpModalOpen)
  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o),
  }
}

export default function DrawerTopUp() {
  const { open, setOpen } = useTopUpModal()
  const { wallet } = useSentientWallet()
  const [amount, setAmount] = useState("10")
  const [debouncedAmount, setDebouncedAmount] = useState("10")

  const REGION = "us-ca" // US California
  const EVM_ADDRESS = wallet?.evm?.address

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount)
    }, 500)
    return () => clearTimeout(timer)
  }, [amount])

  const { data: metamaskQuotes, isLoading } = useSWR(
    EVM_ADDRESS && parseFloat(debouncedAmount) >= 5
      ? `/api/quotes/metamask?amount=${debouncedAmount}&address=${EVM_ADDRESS}&region=${REGION}`
      : null,
    (url) => fetch(url).then((r) => r.json())
  )

  const processBuyAssets = async () => {
    const req = await fetch(`/api/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purchaseCurrency: "USDC",
        destinationNetwork: "base",
        destinationAddress: EVM_ADDRESS!,
        paymentAmount: "10",
        paymentMethod: "CARD",
      } satisfies {
        purchaseCurrency: "USDC" | "USDT" | "ETH"
        destinationNetwork:
          | "base"
          | "ethereum"
          | "polygon"
          | "arbitrum"
          | "optimism"
        destinationAddress: string
        paymentAmount?: string
        paymentCurrency?: "USD"
        paymentMethod?: "CARD"
        country?: string
        subdivision?: string
        redirectUrl?: string
        clientIp?: string
        partnerUserRef?: string
      }),
    })
    const data = await req.json()

    console.debug({ data })
    window.open(data.session.onrampUrl, "_blank", "noopener,noreferrer")
  }

  const handleBuyClick = async (
    provider: MetamaskQuoteLinkRequest["provider"]
  ) => {
    if (!EVM_ADDRESS) return

    const response = await fetch("/api/quotes/metamask/buy-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: EVM_ADDRESS,
        provider,
        region: REGION,
        amount: debouncedAmount,
      } satisfies MetamaskQuoteLinkRequest),
    })

    const data = await response.json()
    if (data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer")
    }
  }

  const buyWithDaimoPay = () => {
    const link = getMiniAppActionLink({
      actionAppId: "app_e7d27c5ce2234e00558776f227f791ef",
      path: "/bridge",
      params: {
        toAddress: EVM_ADDRESS!,
        toToken: TOKEN_USDC.chains.WORLD?.address!,
        amountUsd: debouncedAmount,
      },
    })
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Add Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          <div>
            <label className="text-xs text-white/60 mb-2 block">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                $
              </span>
              <input
                type="number"
                min="5"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                className="w-full h-14 pl-8 pr-4 rounded-lg bg-white/5 border border-white/10 text-lg outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <p className="text-xs text-white/60 mt-1">Minimum: $5</p>
          </div>

          {isLoading && (
            <div className="text-center text-sm text-white/60">
              Loading quotes...
            </div>
          )}

          {metamaskQuotes?.success && metamaskQuotes.success.length > 0 && (
            <div className="flex max-h-[50vh] overflow-auto flex-1 flex-col gap-2">
              <h3 className="text-sm font-semibold text-white/60">
                Available Providers
              </h3>

              <div className="space-y-2">
                {metamaskQuotes.success.map((quote: any) => (
                  <button
                    key={quote.provider}
                    onClick={() => handleBuyClick(quote.provider)}
                    className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://on-ramp-cache.api.cx.metamask.io${quote.providerInfo.logos.dark}`}
                          className="w-20"
                          alt=""
                        />
                        <div>
                          <div className="font-semibold">
                            {quote.providerInfo.name}
                          </div>
                          <div className="text-xs text-white/60">
                            {quote.quote.amountOut.toFixed(2)}{" "}
                            {quote.quote.crypto.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ${quote.quote.amountIn}
                        </div>
                        <div className="text-xs text-white/60">
                          Fee: ${quote.quote.providerFee.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={processBuyAssets}>Buy with Coinbase</Button>
          <Button>Buy with DaimoPay</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
