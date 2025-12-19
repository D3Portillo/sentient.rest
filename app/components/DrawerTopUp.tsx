"use client"

import type { MetamaskQuoteResponse } from "@/app/api/quotes/metamask/route"
import type { MetamaskQuoteLinkRequest } from "@/app/api/quotes/metamask/buy-link/route"
import { useState, useEffect, Fragment } from "react"
import { atom, useAtom } from "jotai"
import useSWR from "swr"

import { NumpadInput } from "@/components/NumpadInput"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { useSentientWallet } from "@/lib/wallets"
import { getMiniAppActionLink } from "@/lib/world"
import { jsonify } from "@/lib/utils"

import { TOKEN_USDC } from "@/lib/registry"
import { IoCard, IoSwapHorizontal } from "react-icons/io5"
import { TbWorld } from "react-icons/tb"

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

const MIN_MM_DEPOSIT = 5
const MIN_DEPOSIT_USD = 1

type DepositMethod = "card" | "world" | "cross-chain"
type FlowStep = "amount" | "method" | "provider"

export default function DrawerTopUp() {
  const { open, setOpen } = useTopUpModal()
  const { wallet } = useSentientWallet()
  const [amount, setAmount] = useState("")
  const [debouncedAmount, setDebouncedAmount] = useState("")
  const [step, setStep] = useState<FlowStep>("amount")
  const [method, setMethod] = useState<DepositMethod | null>(null)

  const REGION = "us-ca"
  const EVM_ADDRESS = wallet?.evm?.address

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount)
    }, 500)
    return () => clearTimeout(timer)
  }, [amount])

  useEffect(() => {
    if (!open) {
      setStep("amount")
      setMethod(null)
      setAmount("")
    }
  }, [open])

  const { data: metamaskQuotes = null, isLoading } = useSWR(
    EVM_ADDRESS &&
      parseFloat(debouncedAmount) >= MIN_MM_DEPOSIT &&
      method === "card" &&
      step === "provider"
      ? `quote.mm.${EVM_ADDRESS}.${REGION}.${debouncedAmount}`
      : null,
    async () => {
      if (!EVM_ADDRESS) return null
      const data = await jsonify<MetamaskQuoteResponse>(
        fetch(
          `/api/quotes/metamask?amount=${debouncedAmount}&address=${EVM_ADDRESS}&region=${REGION}`
        )
      )
      return data
    }
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

    window.open(link, "_blank", "noopener,noreferrer")
  }

  const handleAmountContinue = () => {
    const value = parseFloat(amount)
    if (!value || value < MIN_DEPOSIT_USD) return
    setStep("method")
  }

  const handleMethodSelect = (selectedMethod: DepositMethod) => {
    setMethod(selectedMethod)
    if (selectedMethod === "cross-chain") {
      buyWithDaimoPay()
      setOpen(false)
    } else {
      setStep("provider")
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>
            {step === "amount" && "Add Funds"}
            {step === "method" && `Add Funds ($${amount})`}
            {step === "provider" && "Select Provider"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1 overflow-auto">
          {step === "amount" && (
            <Fragment>
              <div className="flex-1 grid place-items-center">
                <NumpadInput
                  type="amount"
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                />
              </div>
              <Button
                onClick={handleAmountContinue}
                disabled={!amount || parseFloat(amount) < MIN_DEPOSIT_USD}
              >
                Continue
              </Button>
            </Fragment>
          )}

          {step === "method" && (
            <div className="flex pt-2 flex-col gap-3 flex-1">
              <MethodOption
                icon={<IoCard className="text-2xl" />}
                title="Credit/Debit Card"
                description="Use credit/debit card to top-up"
                onClick={() => handleMethodSelect("card")}
              />
              <MethodOption
                icon={<TbWorld className="text-2xl" />}
                title="World Deposit"
                description="Deposit WLD/USDC via World App"
                onClick={() => handleMethodSelect("world")}
              />
              <MethodOption
                icon={<IoSwapHorizontal className="text-2xl" />}
                title="Cross-Chain Bridge"
                description="Deposit via other chains (DaimoPay)"
                onClick={() => handleMethodSelect("cross-chain")}
              />
            </div>
          )}

          {step === "provider" &&
            (method === "card" ? (
              isLoading ? (
                <div className="text-center grow grid place-items-center text-sm text-white/60">
                  <p>Loading...</p>
                </div>
              ) : (
                <div className="flex -mx-4 px-4 flex-col gap-2 flex-1 overflow-auto">
                  <button
                    onClick={processBuyAssets}
                    className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderIcon seed="coinbase-pay" nameCharacter="C" />
                      <div className="flex-1">
                        <div className="font-semibold">Coinbase Pay</div>
                        <div className="text-xs text-white/60">
                          Fast & trusted
                        </div>
                      </div>
                    </div>
                  </button>

                  {(metamaskQuotes?.success || [])
                    // Sort by lowest fees taken (i.e., highest amountOut)
                    .sort((a, b) => b.quote.amountOut - a.quote.amountOut)
                    .map((quote) => {
                      const REAL_FEE =
                        quote.quote.amountIn - quote.quote.amountOut

                      return (
                        <button
                          key={`mm-quote-${quote.provider}`}
                          onClick={() => handleBuyClick(quote.provider as any)}
                          className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ProviderIcon
                                seed={quote.provider}
                                nameCharacter={quote.providerInfo.name.charAt(
                                  0
                                )}
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
                                Fee: ${REAL_FEE.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              )
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-white opacity-60">
                  <TbWorld className="text-4xl mx-auto mb-4" />
                  <p>World Chain deposit coming soon</p>
                  <p className="text-xs mt-2">
                    Deposit WLD/USDC via Uniswap pool
                  </p>
                </div>
              </div>
            ))}

          {step !== "amount" && (
            <Button
              variant="secondary"
              onClick={() => {
                if (step === "method") {
                  setAmount("")
                  return setStep("amount")
                }

                if (step === "provider") {
                  return setStep("method")
                }
              }}
            >
              Go Back
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function MethodOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/7 transition-colors text-left group"
    >
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-lg bg-white/5 grid place-items-center group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-white/60">{description}</div>
        </div>
      </div>
    </button>
  )
}

function ProviderIcon({
  seed,
  nameCharacter,
}: {
  seed: string
  nameCharacter: string
}) {
  const bgColor = `hsl(${
    Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
  }, 50%, 50%)`

  return (
    <figure
      className="size-8 rounded grid place-items-center font-bold text-lg"
      style={{ backgroundColor: bgColor }}
    >
      {nameCharacter}
    </figure>
  )
}
