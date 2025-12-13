"use client"

import { atom, useAtom } from "jotai"
import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { IoChevronDown } from "react-icons/io5"
import { DEPOSIT_CHAINS } from "./DialogAddress"
import Button from "./Button"

const atomWithdrawModalOpen = atom(false)
export const useWithdrawModal = () => {
  const [open, setOpen] = useAtom(atomWithdrawModalOpen)
  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o),
  }
}

const TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "0.00",
    iconImage: "/tokens/usdc.png",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: "0.00",
    iconImage: "/tokens/usdt.png",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "0.00",
    iconImage: "/tokens/eth.png",
  },
  {
    symbol: "WLD",
    name: "Worldcoin",
    balance: "0.00",
    iconImage: "/tokens/wld.png",
  },
]

export default function DrawerWithdraw() {
  const { open, setOpen } = useWithdrawModal()
  const [selectedToken, setSelectedToken] = useState(TOKENS[0])
  // WLD is default selected
  const [selectedChain, setSelectedChain] = useState(DEPOSIT_CHAINS[1])
  const [amount, setAmount] = useState("")

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100vh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Transfer Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          {/* Token Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Token</label>
            <button className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
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
              <IoChevronDown className="text-white/60" />
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-white/60">Amount</label>
              <span className="text-xs text-white/60">
                Balance: {selectedToken.balance} {selectedToken.symbol}
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

          {/* Chain Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Network</label>
            <button className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
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
              <IoChevronDown className="text-white/60" />
            </button>
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
          <p className="text-xs text-white/60 text-center">
            Funds will be sent to your selected network. Make sure the receiving
            address supports this network.
          </p>

          <div className="flex-1" />

          <Button>Confirm Transfer</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
