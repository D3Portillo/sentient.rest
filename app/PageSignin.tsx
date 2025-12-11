import { useAtom, atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"
import { FaArrowRight } from "react-icons/fa"
import { Logo } from "./components/icons"
import PageContainer from "./PageContainer"
import { useEffect, useState } from "react"
import { privateKeyToAccount } from "viem/accounts"
import { keccak256, toHex } from "viem"

interface WalletData {
  encryptedKey: string
  address: string
}

const atomWallet = atomWithStorage<WalletData | null>("sw.wallet", null)

// Simple XOR encryption using signature + PIN
function encryptPrivateKey(
  privateKey: string,
  pin: string,
  signature: string
): string {
  const key = signature + pin
  let encrypted = ""
  for (let i = 0; i < privateKey.length; i++) {
    encrypted += String.fromCharCode(
      privateKey.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return btoa(encrypted)
}

function decryptPrivateKey(
  encryptedKey: string,
  pin: string,
  signature: string
): string {
  const key = signature + pin
  const encrypted = atob(encryptedKey)
  let decrypted = ""
  for (let i = 0; i < encrypted.length; i++) {
    decrypted += String.fromCharCode(
      encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    )
  }
  return decrypted
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

export default function PageSignin() {
  const { signIn, isConnected } = useWorldAuth()

  const [wallet, setWallet] = useAtom(atomWallet)
  const [unlockedWallet, setUnlockedWallet] = useAtom(atomUnlockedWallet)
  const [pinMode, setPinMode] = useState<"create" | "unlock" | null>(null)

  const handleCreateWallet = async (pin: string) => {
    try {
      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: "Create Sentient Wallet",
      })

      if (!finalPayload || finalPayload.status === "error") {
        throw new Error("No signature received")
      }

      const signature = finalPayload.signature
      const privateKeyHash = keccak256(toHex(signature))
      const account = privateKeyToAccount(privateKeyHash)
      const encryptedKey = encryptPrivateKey(privateKeyHash, pin, signature)

      const newWallet: WalletData = {
        encryptedKey,
        address: account.address,
      }

      setWallet(newWallet)
      setPinMode(null)
    } catch (error) {
      console.error("Failed to create wallet:", error)
      alert("Failed to create wallet")
    }
  }

  const handleUnlockWallet = async (pin: string) => {
    try {
      if (!wallet) return

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: "Create Sentient Wallet",
      })

      if (!finalPayload || finalPayload.status === "error") {
        throw new Error("No signature received")
      }

      const privateKey = decryptPrivateKey(
        wallet.encryptedKey,
        pin,
        finalPayload.signature
      )
      const unlockedAccount = privateKeyToAccount(privateKey as `0x${string}`)
      setUnlockedWallet(unlockedAccount)

      if (unlockedAccount.address !== wallet.address) {
        throw new Error("Invalid PIN")
      }

      setPinMode(null)
      console.log("Wallet unlocked:", unlockedAccount.address)
    } catch (error) {
      console.error("Failed to unlock wallet:", error)
      alert("Invalid PIN")
    }
  }

  useEffect(() => {
    if (isConnected) {
      setPinMode(wallet ? "unlock" : "create")
    }
  }, [isConnected, wallet])

  if (pinMode === "create") {
    return (
      <PinInput
        title="Create PIN"
        description="Choose a 4-digit PIN to secure your wallet"
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
    <PageContainer className="items-center justify-center text-center">
      <Logo className="size-16" />
      <h1 className="mt-4 font-semibold text-lg">Sentient Wallet</h1>
      <p className="w-full text-sm max-w-72">
        Let's create or connect your wallet to get you started.
      </p>

      <button
        onClick={signIn}
        className="mt-12 active:scale-98 font-semibold bg-sw-yellow text-black flex gap-4 items-center justify-center h-11 px-5 rounded-lg"
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

  const handleSubmit = () => {
    if (pin.length === 4) {
      onPinComplete(pin)
    }
  }

  return (
    <PageContainer className="items-center justify-center text-center">
      <Logo className="size-16" />
      <h1 className="mt-4 font-semibold text-lg">{title}</h1>
      <p className="w-full text-sm max-w-72">{description}</p>
      <input
        type="number"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.slice(0, 4))}
        className="mt-8 w-32 h-12 text-center text-2xl border-2 rounded-lg"
        placeholder="0000"
        autoFocus
      />
      <button
        disabled={pin.length !== 4}
        onClick={handleSubmit}
        className="mt-8 disabled:opacity-50 active:scale-98 font-semibold bg-sw-yellow text-black flex gap-4 items-center justify-center h-11 px-5 rounded-lg"
      >
        Continue
      </button>
    </PageContainer>
  )
}
