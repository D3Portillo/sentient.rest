"use client"

import { Fragment, useEffect, useState } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { worldchain } from "viem/chains"
import useSWR from "swr"

import { useSentientWallet } from "@/lib/wallets"
import { CHAIN_WORLD, getTokensForChain, TOKEN_WLD } from "@/app/lib/registry"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import Button from "@/components/Button"

import { fetchTokenBalances } from "@/lib/balances"
import { localizeNumber } from "@/lib/numbers"
import { executePayment } from "@/lib/payments"

export default function WorldDeposit({ initialAmount = "" }) {
  const { address, signIn } = useWorldAuth()

  const [selectedToken, setSelectedToken] = useState(TOKEN_WLD)
  const [amount, setAmount] = useState("")
  const { wallet } = useSentientWallet()

  const TOKENS = getTokensForChain(CHAIN_WORLD.id).filter((t) =>
    // Only show WLD and USDC for World deposits
    ["WLD", "USDC"].includes(t.symbol)
  )

  useEffect(() => {
    setAmount(initialAmount == "0" ? "" : initialAmount)
  }, [initialAmount])

  const { data: balances = null } = useSWR(
    address ? `balances-usdc-wld-${address}` : null,
    async () => {
      if (!address) return null
      const balances = await fetchTokenBalances(
        {
          chainType: CHAIN_WORLD.chainType,
          rpcURL: CHAIN_WORLD.rpcURL,
          chainConfig: worldchain,
        },
        address,
        TOKENS.map(({ symbol, chains }) => {
          const chainData = (chains as any)[CHAIN_WORLD.id]
          return {
            ...chainData,
            symbol,
          }
        })
      )

      const USDC = balances.find((b) => b.symbol === "USDC") || null
      const WLD = balances.find((b) => b.symbol === "WLD") || null

      return {
        USDC,
        WLD,
      }
    },
    {
      keepPreviousData: true,
      refreshInterval: 5_000, // every 5s
    }
  )

  const isWLDDeposit = selectedToken.symbol === "WLD"

  const BALANCE_WLD = balances?.WLD?.formattedBalance || "0"
  const BALANCE_USDC = balances?.USDC?.formattedBalance || "0"
  const BALANCE = Number(isWLDDeposit ? BALANCE_WLD : BALANCE_USDC)

  const SYMBOL = isWLDDeposit ? "WLD" : "USDC"
  const EVM_WALLET = wallet?.evm?.address

  function handleMaxClick() {
    setAmount(BALANCE.toString())
  }

  async function handleDeposit() {
    if (!address) return signIn()
    if (!EVM_WALLET) return signIn()
    const result = await executePayment({
      paymentDescription: `SentientDeposit(${SYMBOL}): ${amount}`,
      recipientAddress: EVM_WALLET,
      token: isWLDDeposit ? "WLD" : "USDC",
      amount: Number(amount),
    })
  }

  return (
    <Fragment>
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
                <SelectItem value={token.symbol} key={`token-${token.symbol}`}>
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
              Balance: {localizeNumber(BALANCE)} {SYMBOL}
            </span>
          </div>
          <div className="relative">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-14 px-4 rounded-lg bg-white/5 border border-white/10 text-lg outline-none focus:border-white/20 transition-colors"
            />
            <button
              onClick={handleMaxClick}
              className="absolute px-2 right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white"
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      <Button onClick={handleDeposit}>Confirm Deposit</Button>
    </Fragment>
  )
}
