import { useAtom, atom } from "jotai"
import { useEffect, useState } from "react"
import { type Address, privateKeyToAccount } from "viem/accounts"
import { atomWithStorage } from "jotai/utils"
import { useWorldAuth } from "@radish-la/world-auth"
import { keccak256, toHex } from "viem"
import { MiniKit } from "@worldcoin/minikit-js"
import { OTPInput } from "input-otp"

import { FaArrowRight } from "react-icons/fa"
import { IoShield } from "react-icons/io5"

import { Logo } from "./components/icons"
import PageContainer from "./PageContainer"

interface WalletData {
  encryptedPin: string
  iv: string
  address: string
}

const atomWallets = atomWithStorage<Record<Address, WalletData | null>>(
  "sw.wallets",
  {}
)

// AES-GCM encryption using Web Crypto API
async function encryptPin(
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

async function decryptPin(
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
  null as null | ReturnType<typeof privateKeyToAccount>
)

export const useSentientWallet = () => {
  const [wallet] = useAtom(atomUnlockedWallet)

  return {
    wallet,
  }
}

const WALLET_CREATE_MESSAGE = "Create Sentient Wallet"

export default function PageSignin() {
  const { signIn, isConnected, address } = useWorldAuth()
  const [wallets, setWallets] = useAtom(atomWallets)
  const [, setUnlockedWallet] = useAtom(atomUnlockedWallet)
  const [pinMode, setPinMode] = useState<"create" | "unlock" | null>(null)

  const WALLET = address ? wallets[address] : null
  const handleCreateWallet = async (pin: string) => {
    try {
      if (!address) throw new Error("NotConnected")

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: WALLET_CREATE_MESSAGE,
      })

      if (finalPayload?.status !== "success") {
        throw new Error("SignatureFailed")
      }

      const signature = finalPayload.signature
      const privateKeyHash = keccak256(toHex(signature))
      const account = privateKeyToAccount(privateKeyHash)
      const { encrypted, iv } = await encryptPin(pin, signature)

      setWallets((prev) => ({
        ...prev,
        [address]: {
          encryptedPin: encrypted,
          iv,
          address: account.address,
        },
      }))

      setUnlockedWallet(account)
      setPinMode(null)
    } catch (error) {
      console.error({ error })
    }
  }

  const handleUnlockWallet = async (pin: string) => {
    try {
      if (!address) throw new Error("NotConnected")
      if (!WALLET) throw new Error("NoWallet")

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: WALLET_CREATE_MESSAGE,
      })

      if (!finalPayload || finalPayload.status === "error") {
        throw new Error("SignatureFailed")
      }

      const decryptedPin = await decryptPin(
        WALLET.encryptedPin,
        WALLET.iv,
        finalPayload.signature
      )

      if (decryptedPin !== pin) {
        throw new Error("InvalidPIN")
      }

      const privateKeyHash = keccak256(toHex(finalPayload.signature))
      const account = privateKeyToAccount(privateKeyHash)

      if (account.address !== WALLET.address) {
        throw new Error("WalletMismatch")
      }

      setUnlockedWallet(account)
      setPinMode(null)
    } catch (error) {
      console.error({ error })
    }
  }

  useEffect(() => {
    if (isConnected) {
      setPinMode(WALLET ? "unlock" : "create")
    }
  }, [isConnected, WALLET?.address])

  if (pinMode === "create") {
    return (
      <PinInput
        title="Create PIN"
        description="Secure your wallet with a 4-digit PIN"
        onPinComplete={handleCreateWallet}
      />
    )
  }

  if (pinMode === "unlock") {
    return (
      <PinInput
        title="Enter PIN"
        description="Unlock your wallet"
        onPinComplete={handleUnlockWallet}
      />
    )
  }

  return (
    <PageContainer className="items-center justify-center">
      <Logo className="size-16" />
      <h1 className="mt-4 font-semibold text-lg">Sentient Wallet</h1>
      <p className="w-full text-center text-sm max-w-72">
        Let's connect your wallet to get started with Sentient.
      </p>

      <button
        onClick={signIn}
        className="mt-12 active:scale-98 font-semibold bg-sw-yellow text-black flex gap-4 items-center justify-center h-12 px-5 rounded-xl"
      >
        <span>Connect Wallet</span>
        <FaArrowRight className="scale-105" />
      </button>
    </PageContainer>
  )
}

interface PinInputProps {
  title: string
  description: string
  onPinComplete: (pin: string) => void
}

function PinInput({ title, description, onPinComplete }: PinInputProps) {
  const [pin, setPin] = useState("")

  const handleChange = (value: string) => {
    setPin(value)
    if (value.length === 4) {
      onPinComplete(value)
    }
  }

  return (
    <PageContainer className="items-center">
      <section className="flex flex-col items-center justify-center min-h-[40vh]">
        <figure className="size-16 bg-linear-to-br from-sw-yellow/15 rounded-xl border border-sw-yellow/15 to-white/15 grid place-items-center">
          <IoShield className="text-4xl scale-95 text-amber-50" />
        </figure>

        <h1 className="mt-4 font-semibold text-lg">{title}</h1>
        <p className="w-full text-sm max-w-72">{description}</p>
      </section>

      <OTPInput
        containerClassName="mt-8 flex border border-white/20 rounded-lg overflow-hidden"
        maxLength={4}
        onChange={handleChange}
        value={pin}
        render={({ slots }) =>
          slots.map((slot, idx) => (
            <div
              key={`input-item-${idx}`}
              className="size-12 text-center text-2xl border-white/20 not-first:border-l grid place-content-center"
            >
              {slot.char || (
                <span className="text-white/40 pointer-events-none">0</span>
              )}
            </div>
          ))
        }
      />
    </PageContainer>
  )
}
