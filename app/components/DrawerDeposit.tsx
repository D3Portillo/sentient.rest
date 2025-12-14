"use client"

import { atom, useAtom } from "jotai"
import { useState } from "react"
import QRCode from "react-qr-code"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select"
import { useSentientWallet } from "@/lib/wallets"

import { IoCopy, IoCheckmark } from "react-icons/io5"

import { TOKENS } from "./DrawerWithdraw"
import { DEPOSIT_CHAINS } from "./DialogAddress"
import Button from "./Button"

const atomDepositModalOpen = atom(false)
export const useDepositModal = () => {
  const [open, setOpen] = useAtom(atomDepositModalOpen)
  return {
    open,
    setOpen,
    toggle: () => setOpen((o) => !o),
  }
}

export default function DrawerDeposit() {
  const { open, setOpen } = useDepositModal()
  const { wallet } = useSentientWallet()
  const [selectedChain, setSelectedChain] = useState(DEPOSIT_CHAINS[1])
  const [selectedToken, setSelectedToken] = useState(TOKENS[0])
  const [copied, setCopied] = useState(false)

  const isSolana = selectedChain.name.toLowerCase().includes("solana")
  const isFuel = selectedChain.name.toLowerCase().includes("fuel")

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

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Deposit Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          {/* Token Selection */}
          <div>
            <label className="text-xs text-white/60 mb-2 block">Token</label>
            <Select
              value={selectedToken.symbol}
              onValueChange={(value) => {
                const token = TOKENS.find((t) => t.symbol === value)
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
                {TOKENS.map((token) => (
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
              value={selectedChain.name}
              onValueChange={(value) => {
                const chain = DEPOSIT_CHAINS.find((c) => c.name === value)
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
                {DEPOSIT_CHAINS.map((chain) => (
                  <SelectItem
                    onClick={() => setSelectedChain(chain)}
                    key={`chain-${chain.name}`}
                    value={chain.name}
                  >
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

          {/* Info Section */}
          <div className="p-4 rounded-lg bg-white/5 space-y-2">
            <div className="flex flex-col items-center gap-4 pb-5">
              <button
                onClick={handleCopy}
                className="flex text-sm text-left active:scale-98 w-full items-start gap-2"
              >
                <div className="break-all grow">
                  <span className="text-white/60">Address /</span>{" "}
                  {depositAddress || "Generating..."}
                </div>

                <div className="shrink-0 text-base pt-1">
                  {copied ? <IoCheckmark className="scale-110" /> : <IoCopy />}
                </div>
              </button>

              <div className="bg-white relative size-[clamp(10rem,50vw,16rem)] p-2 rounded-lg">
                {depositAddress && (
                  <figure className="absolute z-1 size-9 border-2 border-white overflow-hidden rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <img
                      src={selectedChain.iconImage}
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
              <span>0.01 {selectedToken.symbol}</span>
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
