import type { Hex } from "viem"
import { Wallet } from "fuels"

export const getFuelWalletFromSeed = (seed: Hex) => {
  const wallet = Wallet.fromSeed(seed)

  return {
    address: wallet.address.toB256(),
    wallet,
  }
}
