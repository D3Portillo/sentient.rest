"use client"

import type { SessionTokenRequest } from "@/app/api/session/route"
import { atom, useAtom } from "jotai"
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk"
import useSWR from "swr"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer"
import { useSentientWallet } from "@/lib/wallets"
import { jsonify } from "@/lib/utils"

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

  const EVM_ADDRESS = wallet?.evm?.address
  const { data: quoteData = null } = useSWR(
    EVM_ADDRESS ? `session.${EVM_ADDRESS}` : null,
    async () => {
      if (!EVM_ADDRESS) return null
      const data = await jsonify<{
        token: string
        quote: any
      }>(
        fetch("/api/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addresses: [
              {
                address: EVM_ADDRESS,
                blockchains: ["base"],
              },
            ],
          } satisfies SessionTokenRequest),
        })
      )

      return data
    }
  )

  const processBuyAssets = async () => {
    new RampInstantSDK({
      hostAppName: "Your App",
      fiatCurrency: "USD",
      credentialless: true,
      fiatValue: "10",
      enabledFlows: ["ONRAMP"],
      offrampAsset: "BASE_USDC",
      defaultAsset: "BASE_USDC",
      hideExitButton: true,
      defaultFlow: "ONRAMP",
      userAddress: EVM_ADDRESS!,
      hostApiKey: "wn25y7nx6cyb4oqutc5obnnywwwt4gz36yw5fypw",
    }).show()
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="max-w-md h-[calc(100dvh-3rem-var(--spacing-safe-bottom))] mx-auto border-white/10">
        <DrawerHeader className="pb-6">
          <DrawerTitle>Add Funds</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-4 flex-1">
          <div className="flex-1" />
          <Button onClick={processBuyAssets}>Buy</Button>
          <Button>View Transactions</Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
