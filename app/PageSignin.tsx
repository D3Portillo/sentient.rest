import { type Address, privateKeyToAccount } from "viem/accounts"
import { useEffect, useState } from "react"
import { atomWithStorage } from "jotai/utils"
import { keccak256, toHex } from "viem"
import { useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"
import { OTPInput } from "input-otp"

import { decryptPin, encryptPin, useSentientWallet } from "@/lib/wallets"

import { FaArrowRight } from "react-icons/fa"
import { IoShield } from "react-icons/io5"
import { SiEnpass } from "react-icons/si"

import { beautifyAddress, cn } from "./lib/utils"
import { Logo } from "./components/icons"
import Button from "@/components/Button"
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

const getPinSignatureMessage = (address: Address, pin: string) =>
  `Sentient Wallet Access @ ${
    // 18 characters fingerprint, including the "0x"
    beautifyAddress(keccak256(toHex(address + pin)), 9, "")
  }`

export default function PageSignin() {
  const [pinMode, setPinMode] = useState<"create" | "unlock" | null>(null)

  const { signIn, isConnected, address } = useWorldAuth()
  const { unsafeSetWallet } = useSentientWallet()

  const [wallets, setWallets] = useAtom(atomWallets)
  const WALLET = address ? wallets[address] : null

  const handleCreateWallet = async (pin: string) => {
    try {
      if (!address) throw new Error("NotConnected")

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: getPinSignatureMessage(address, pin),
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

      unsafeSetWallet(account)
      setPinMode(null)
    } catch (error) {
      console.error({ error })
      return { error: (error as Error)?.message || "UnknownError" }
    }

    return { error: null }
  }

  const handleUnlockWallet = async (pin: string) => {
    try {
      if (!address) throw new Error("NotConnected")
      if (!WALLET) throw new Error("NoWallet")

      const { finalPayload } = await MiniKit.commandsAsync.signMessage({
        message: getPinSignatureMessage(address, pin),
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

      unsafeSetWallet(account)
      setPinMode(null)
    } catch (error) {
      console.error({ error })
      return { error: (error as Error)?.message || "UnknownError" }
    }

    return { error: null }
  }

  useEffect(() => {
    if (isConnected) {
      setPinMode(WALLET ? "unlock" : "create")
    }
  }, [isConnected, WALLET?.address])

  if (pinMode === "create") {
    return (
      <PinInput
        theme="yellow"
        icon={<IoShield className="text-4xl scale-95" />}
        title="Create PIN"
        description="Secure your wallet with a 4-digit PIN"
        onPinComplete={handleCreateWallet}
      />
    )
  }

  if (pinMode === "unlock") {
    return (
      <PinInput
        theme="blue"
        icon={<SiEnpass className="text-3xl" />}
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

      <Button onClick={signIn} className="mt-12">
        <span>Connect Wallet</span>
        <FaArrowRight className="scale-105" />
      </Button>
    </PageContainer>
  )
}

function PinInput({
  icon,
  theme,
  title,
  description,
  onPinComplete,
}: {
  title: string
  theme: "yellow" | "blue"
  description: string
  icon: React.ReactNode
  onPinComplete: (pin: string) => Promise<{ error: string | null }>
}) {
  const [error, setError] = useState<string>("")
  const [pin, setPin] = useState("")

  const handleChange = async (value: string) => {
    // Clean error on new input
    if (error) setError("")

    setPin(value)
    if (value.length === 4) {
      const { error } = await onPinComplete(value)
      if (error) {
        // Handle error (e.g., show message)
        setPin("")
        setError(error)
      }
    }
  }

  useEffect(() => {
    // Hide error after 3 seconds
    if (!error) return
    const timer = setTimeout(() => {
      setError("")
    }, 3000)

    return () => clearTimeout(timer)
  }, [error])

  return (
    <PageContainer className="items-center relative z-1">
      <div className="fixed pointer-events-none inset-0">
        <figure
          className={cn(
            theme === "yellow" ? "bg-sw-yellow/20" : "bg-sw-blue/20",
            "size-[min(14rem,50vw)] blur-[200px] rounded-full absolute -translate-x-1/2 top-12 left-1/2"
          )}
        />
      </div>
      <section className="flex flex-col items-center justify-center min-h-[40vh]">
        <figure
          className={cn(
            theme === "yellow"
              ? "from-sw-yellow/20 border-sw-yellow/15"
              : "from-sw-blue/20 border-sw-blue/20",
            "size-18 bg-linear-to-br to-white/15 rounded-xl border grid place-items-center"
          )}
        >
          {icon}
        </figure>

        <h1 className="mt-4 font-semibold text-lg">{title}</h1>
        <p className="w-full text-sm max-w-72">{description}</p>
      </section>

      <OTPInput
        containerClassName="mt-8 flex border border-white/20 rounded-lg"
        maxLength={4}
        autoFocus
        value={pin}
        // Replace any non-digit characters
        onChange={(e) => handleChange(e.replace(/\D/g, ""))}
        render={({ slots }) =>
          slots.map((slot, idx) => (
            <div
              key={`input-item-${idx}`}
              className={cn(
                "size-12 outline-2 outline-transparent text-center text-2xl border-white/20 not-first:border-l grid place-content-center",
                slot.isActive && "rounded-lg outline-white"
              )}
            >
              {slot.char || (
                <span className="text-white/40 pointer-events-none">0</span>
              )}
            </div>
          ))
        }
      />
      {error && (
        <p className="text-red-400 my-5 text-xs">Oops! Something went wrong</p>
      )}
    </PageContainer>
  )
}
