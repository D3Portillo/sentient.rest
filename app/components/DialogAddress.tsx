"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { useWorldProfile } from "@/hooks/world"
import { beautifyAddress } from "@/lib/utils"

import { FaArrowRight } from "react-icons/fa"

import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"
import Button from "./Button"

// Supported deposit chains
export const DEPOSIT_CHAINS = [
  { name: "Base", iconImage: "/chains/base.png" },
  { name: "Worldchain", iconImage: "/chains/world.png" },
  { name: "Arbitrum", iconImage: "/chains/arbitrum.png" },
  { name: "Optimism", iconImage: "/chains/optimism.png" },
  { name: "Fuel", iconImage: "/chains/fuel.png" },
  { name: "Solana", iconImage: "/chains/solana.png" },
]

export default function DialogAddress() {
  const { address, signOut } = useWorldAuth()
  const { profile } = useWorldProfile(address)

  const USERNAME =
    profile?.username ||
    (address ? beautifyAddress(address, 4, "") : "Not Connected")

  return (
    <Dialog
      trigger={
        <div
          role="button"
          className="bg-white/10 cursor-pointer border border-white/5 backdrop-blur-sm rounded-full pl-1.5 py-1.5 pr-3 flex items-center gap-2"
        >
          <AddressBlock address={address} />
          <span className="text-sm font-semibold">{USERNAME}</span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <AddressBlock
          className="size-20 outline outline-white/15"
          address={address}
        />
        <nav className="flex justify-center items-center gap-1.5">
          <div className="font-black text-lg">{USERNAME}</div>
        </nav>

        {/* Actions */}
        <div className="w-full mt-4 grid gap-4">
          <Button variant="secondary" onClick={signOut}>
            Disconnect
          </Button>

          <Button className="bg-white outline-2 outline-white/20 px-6 hover:bg-white/95">
            <span className="grow text-left">Deposit</span>

            {/* Overlapping chain logos */}
            <div className="flex -space-x-2 ml-2">
              {DEPOSIT_CHAINS.map((chain, idx) => (
                <figure
                  key={`chain-${chain.name}`}
                  className="size-6 rounded-full overflow-hidden bg-gray-300 border border-black"
                  style={{ zIndex: DEPOSIT_CHAINS.length - idx }}
                >
                  <img
                    src={chain.iconImage}
                    className="size-full object-cover"
                    alt=""
                  />
                </figure>
              ))}
            </div>

            <FaArrowRight className="text-lg" />
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
