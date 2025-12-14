import { useAtom, atom } from "jotai"
import { privateKeyToAccount } from "viem/accounts"
import { type getSolanaAccountFromSeed } from "./solana"
import { getFuelWalletFromSeed } from "./fuel"

// AES-GCM encryption using Web Crypto API
export async function encryptPin(
  pin: string,
  signature: string
): Promise<{ encrypted: string; iv: string }> {
  // Derive 256-bit key from signature using SHA-256
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(signature)
  )
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  )

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt PIN
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(pin)
  )

  return {
    encrypted: Buffer.from(encrypted).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  }
}

export async function decryptPin(
  encryptedPin: string,
  iv: string,
  signature: string
): Promise<string> {
  // Derive same key from signature
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(signature)
  )
  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  )

  // Convert base64 strings back to Uint8Array
  const encryptedBytes = Buffer.from(encryptedPin, "base64")
  const ivBytes = Buffer.from(iv, "base64")

  // Decrypt PIN
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encryptedBytes
  )

  return new TextDecoder().decode(decrypted)
}

const atomUnlockedWallet = atom(
  null as null | {
    evm: ReturnType<typeof privateKeyToAccount>
    solana: Awaited<ReturnType<typeof getSolanaAccountFromSeed>>
    fuel: ReturnType<typeof getFuelWalletFromSeed>
  }
)

export const useSentientWallet = () => {
  const [wallet, unsafeSetWallet] = useAtom(atomUnlockedWallet)

  return {
    wallet,
    unsafeSetWallet,
  }
}
