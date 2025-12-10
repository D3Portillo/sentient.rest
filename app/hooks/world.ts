import type { Address } from "viem"
import useSWRImmutable from "swr/immutable"
import { MiniKit } from "@worldcoin/minikit-js"

export const useWorldProfile = (address?: Address) => {
  const { data: profile = null } = useSWRImmutable(
    address ? `world.profile.${address}` : null,
    async () => {
      if (!address) return null
      return await MiniKit.getUserByAddress(address)
    }
  )

  return {
    profile,
  }
}
