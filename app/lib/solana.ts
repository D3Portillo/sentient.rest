import { type Hex, toBytes } from "viem"
import {
  getAddressDecoder,
  createKeyPairFromPrivateKeyBytes,
} from "@solana/kit"

export const getSolanaAccountFromSeed = async (seed: Hex) => {
  // Extractable keypair from signature bytes
  const keypair = await createKeyPairFromPrivateKeyBytes(toBytes(seed), true)

  const addressBytes = await crypto.subtle.exportKey("raw", keypair.publicKey)
  const address = getAddressDecoder().decode(new Uint8Array(addressBytes))

  return {
    ...keypair,
    address,
  }
}
