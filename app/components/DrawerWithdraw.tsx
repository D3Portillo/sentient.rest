"use client"

import { atom, useAtom } from "jotai"
import { useEffect, useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import Button from "./Button"
import {
  CHAIN_WORLD,
  TOKENS_LIST,
  TOKEN_WLD,
  getChainsForToken,
} from "@/lib/registry"

const atomWithdrawModalOpen = atom(false)
export const useWithdrawModal = () => {
  const [open, setOpen] = useAtom(atomWithdrawModalOpen)
  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o),
  }
}

export default function DrawerWithdraw() {
  const { open, setOpen } = useWithdrawModal()
  const [selectedChain, setSelectedChain] = useState(CHAIN_WORLD)
  const [selectedToken, setSelectedToken] = useState(TOKEN_WLD)
  const [amount, setAmount] = useState("")

  const CHAINS = getChainsForToken(selectedToken.symbol)

  useEffect(() => {
    // If token not available for chain - set to first available chain
    const isInAvailableChains = CHAINS.find(
      (c) => c.name === selectedChain.name
    )

    if (!isInAvailableChains) setSelectedChain(CHAINS[0])
  }, [selectedToken.symbol])

  useEffect(() => {
    if (open) {
      // Reset to defaults on open
      setSelectedChain(CHAIN_WORLD)
      setSelectedToken(TOKEN_WLD)
      setAmount("")
    }
  }, [open])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Transfer Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          {/* Token Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Token</label>
            <Select
              value={selectedToken.symbol}
              onValueChange={(value) => {
                const token = TOKENS_LIST.find((t) => t.symbol === value)
                if (token) setSelectedToken(token)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center gap-3">
                  <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                    <img
                      src={selectedToken.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>
                  <div className="text-left -space-y-0.5">
                    <div className="font-semibold">{selectedToken.symbol}</div>
                    <div className="text-xs text-white/60">
                      {selectedToken.name}
                    </div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent>
                {TOKENS_LIST.map((token) => (
                  <SelectItem
                    value={token.symbol}
                    key={`token-${token.symbol}`}
                  >
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
                        <div className="text-xs text-white/60">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chain Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Network</label>
            <Select
              value={selectedChain.id}
              onValueChange={(id) => {
                const chain = CHAINS.find((c) => c.id === id)
                if (chain) setSelectedChain(chain)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center gap-3">
                  <figure className="size-6 bg-white/15 rounded-full overflow-hidden">
                    <img
                      src={selectedChain.iconImage}
                      className="size-full object-cover"
                      alt=""
                    />
                  </figure>
                  <span className="font-semibold">{selectedChain.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {CHAINS.map((chain) => (
                  <SelectItem key={`chain-${chain.name}`} value={chain.id}>
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
                Balance: {0} {selectedToken.symbol}
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
              <span>0.01 {selectedToken.symbol}</span>
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
