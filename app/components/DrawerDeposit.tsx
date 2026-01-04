"use client"

import { useEffect, useState } from "react"
import QRCode from "react-qr-code"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import { useSentientWallet } from "@/lib/wallets"
import { useComposableModalState } from "@/lib/modals"

import { CHAINS_LIST, getTokensForChain } from "@/lib/registry"
import { IoCopy, IoCheckmark } from "react-icons/io5"

import Button from "./Button"

export const useDepositModal = () => useComposableModalState("deposits")
export default function DrawerDeposit() {
  const { isOpen, chain, token, setToken, setChain, close } = useDepositModal()

  const { wallet } = useSentientWallet()
  const [copied, setCopied] = useState(false)

  const isSolana = chain.name.toLowerCase().includes("solana")
  const isFuel = chain.name.toLowerCase().includes("fuel")

  const depositAddress = isFuel
    ? wallet?.fuel.address
    : isSolana
    ? wallet?.solana.address
    : wallet?.evm.address

  const handleCopy = async () => {
    if (!depositAddress) return
    await navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TOKENS = getTokensForChain(chain.id)

  useEffect(() => {
    // Set to first available token for chain when not in list
    const isCurrentTokenAvialable = TOKENS.find(
      (t) => t.symbol === token.symbol
    )
    if (!isCurrentTokenAvialable) setToken(TOKENS[0])
  }, [chain.id])

  return (
    <Drawer open={isOpen} onOpenChange={close}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Deposit Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          {/* Chain Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Network</label>
            <Select
              value={chain.id}
              onValueChange={(id) => {
                const chain = CHAINS_LIST.find((c) => c.id === id)
                if (chain) setChain(chain)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center gap-3">
                  <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                    <img
                      src={chain.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>
                  <span className="font-semibold">{chain.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {CHAINS_LIST.map((item) => (
                  <SelectItem key={`d-chain-${item.name}`} value={item.id}>
                    <div className="flex items-center gap-3">
                      <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                        <img
                          src={item.iconImage}
                          className="size-full object-cover"
                          alt=""
                        />
                      </figure>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Token</label>
            <Select
              value={token.symbol}
              onValueChange={(value) => {
                const token = TOKENS.find((t) => t.symbol === value)
                if (token) setToken(token)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center gap-3">
                  <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                    <img
                      src={token.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>
                  <div className="text-left -space-y-0.5">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-white/60">{token.name}</div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((item) => (
                  <SelectItem
                    value={item.symbol}
                    key={`d-token-${item.symbol}`}
                  >
                    <div className="flex items-center gap-3">
                      <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                        <img
                          src={item.iconImage}
                          className="size-full object-cover"
                          alt=""
                        />
                      </figure>
                      <div className="text-left -space-y-0.5">
                        <div className="font-semibold">{item.symbol}</div>
                        <div className="text-xs text-white/60">{item.name}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-white/5 space-y-2">
            <div className="flex flex-col items-center gap-4 pb-5">
              <button
                onClick={handleCopy}
                className="flex text-xs text-left active:scale-98 w-full items-start gap-2"
              >
                <div className="break-all grow">
                  <span className="text-white/60">Address /</span>{" "}
                  {depositAddress || "Generating..."}
                </div>

                <div className="shrink-0 text-sm pt-0.5">
                  {copied ? <IoCheckmark className="scale-110" /> : <IoCopy />}
                </div>
              </button>

              <div className="bg-white relative size-[clamp(10rem,50vw,16rem)] p-2 rounded-lg">
                {depositAddress && (
                  <figure className="absolute z-1 size-9 border-2 border-white bg-white/90 backdrop-blur overflow-hidden rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img
                      src={chain.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>
                )}
                {depositAddress ? (
                  <QRCode
                    // Force re-render when address changes
                    key={`address-${depositAddress}`}
                    className="size-full object-cover"
                    viewBox="0 0 120 120"
                    value={depositAddress}
                  />
                ) : null}
              </div>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-white/60">Min Deposit</span>
              <span>0.01 {token.symbol}</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-white/60">Processing Time</span>
              <span>~2-5 min</span>
            </div>
          </div>

          <div className="flex-1" />

          <Button>View Transactions</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
