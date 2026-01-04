"use client"

import { useEffect, useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import Button from "./Button"

import { useComposableModalState } from "@/lib/modals"
import { getTokensForChain, CHAINS_LIST } from "@/lib/registry"

export const useWithdrawModal = () => useComposableModalState("withdrawals")
export default function DrawerWithdraw() {
  const { isOpen, chain, token, setToken, setChain, close } = useWithdrawModal()
  const [amount, setAmount] = useState("")

  useEffect(() => {
    // Reset amount on open
    if (isOpen) setAmount("")
  }, [isOpen])

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
          <DrawerTitle>Transfer Funds</DrawerTitle>
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
                  <SelectItem key={`chain-${item.name}`} value={item.id}>
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
                  <SelectItem key={`token-${item.symbol}`} value={item.symbol}>
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

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-white/60">Amount</label>
              <span className="text-xs text-white/60">
                Balance: {0} {token.symbol}
              </span>
            </div>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 text-lg outline-none focus:border-white/20 transition-colors"
              />
              <button className="absolute px-2 right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                MAX
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-2 p-4 rounded-lg bg-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Min Transfer</span>
              <span>0.01 {token.symbol}</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-white/60">Platform Fees</span>
              <span>~$0.50</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-white/60">Processing Time</span>
              <span>~2-5 min</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs mt-2 text-white/60 text-center">
            Make sure the receiving address supports this network.
          </p>

          <div className="flex-1" />

          <Button>Confirm Transfer</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
