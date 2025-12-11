"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { useWorldProfile } from "@/hooks/world"
import { beautifyAddress } from "@/lib/utils"
import AddressBlock from "./AddressBlock"
import Dialog from "./Dialog"

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
          className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-full pl-1.5 py-1.5 pr-3 flex items-center gap-2"
        >
          <AddressBlock address={address} />
          <span className="text-sm font-semibold">{USERNAME}</span>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <AddressBlock
          className="size-20 outline outline-white/15"
          address={address}
        />
        <nav className="flex justify-center items-center gap-1.5">
          <div className="font-black text-lg">{USERNAME}</div>
        </nav>

        <div className="my-4" />

        <button
          onClick={signOut}
          className="h-14 font-semibold w-full rounded-lg bg-white/15 text-white border border-white/15"
        >
          Disconnect
        </button>
      </div>
    </Dialog>
  )
}
