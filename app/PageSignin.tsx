import { type Address, privateKeyToAccount } from "viem/accounts"
import { PropsWithChildren, useEffect, useState } from "react"
import { atomWithStorage } from "jotai/utils"
import { keccak256, toHex } from "viem"
import { useAtom } from "jotai"
import { useWorldAuth } from "@radish-la/world-auth"
import { MiniKit } from "@worldcoin/minikit-js"

import { decryptPin, encryptPin, useSentientWallet } from "@/lib/wallets"
import { getDevPk } from "@/app/actions/dev"
import { isDevEnv } from "@/lib/env"

import { FaArrowRight } from "react-icons/fa"
import { IoBackspaceSharp, IoShield } from "react-icons/io5"
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
  "sw.stored.wallets",
  {}
)

const getPinSignatureMessage = (address: Address, pin: string) =>
  `Wallet Access ― ${
    // 18 characters fingerprint, including the "0x"
    beautifyAddress(keccak256(toHex(address + pin)), 9, "")
  }`

export default function PageSignin() {
  const [pinMode, setPinMode] = useState<"create" | "unlock" | null>(null)

  const { signIn, isConnected, address } = useWorldAuth()
  const { unsafeSetWallet } = useSentientWallet()

  const [wallets, setWallets] = useAtom(atomWallets)
  const WALLET = address ? wallets[address] : null

  async function handleSignIn() {
    if (isDevEnv()) {
      // Mock wallet for dev environment
      return unsafeSetWallet(
        privateKeyToAccount(keccak256(toHex(await getDevPk())))
      )
    }

    signIn()
  }

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

      <Button onClick={handleSignIn} className="mt-12">
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

    // Early exit when exceeding 4 digits
    if (value.length > 4) return

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

  const handleNumpadPress = (digit: number) => handleChange(`${pin}${digit}`)

  const handleBackspace = () => {
    if (error) setError("")
    setPin(pin.slice(0, -1))
  }

  return (
    <PageContainer className="items-center relative z-1 overflow-hidden justify-between pb-8">
      <div className="fixed pointer-events-none inset-0">
        <figure
          className={cn(
            "size-[min(14rem,50vw)] blur-[10rem] rounded-full absolute -translate-x-1/2 top-12 left-1/2",
            theme === "yellow" ? "bg-sw-yellow/20" : "bg-sw-blue/60"
          )}
        />
      </div>

      <section className="flex relative z-1 text-center flex-col items-center justify-center min-h-[40vh]">
        <figure
          className={cn(
            "size-20 border-2 rounded-2xl bg-linear-to-br to-white/15 grid place-items-center",
            theme === "yellow"
              ? "from-sw-yellow/20 border-sw-yellow/15"
              : "from-sw-blue/20 border-sw-blue/20"
          )}
        >
          {icon}
        </figure>

        <h1 className="mt-4 font-semibold text-lg">{title}</h1>
        <p className="w-full text-sm max-w-72">{description}</p>

        {/* PIN Display Dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={`pin-dot-${idx}`}
              className={cn(
                "size-3.5 shrink-0 rounded-full border-2 transition-colors",
                pin.length > idx
                  ? "bg-white border-white"
                  : "border-white/30 bg-transparent"
              )}
            />
          ))}
        </div>

        <p
          className={cn(
            "text-red-400 pointer-events-none mt-6 text-xs",
            error || "opacity-0"
          )}
        >
          Oops! Something went wrong
        </p>
      </section>

      {/* Numpad */}
      <div className="relative pb-6 max-w-72 w-full">
        {/* Gradient fade to device background */}
        <div className="absolute inset-x-0 -top-12 h-screen bg-linear-to-b from-black/0 to-black pointer-events-none" />

        <div className="grid grid-cols-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <PadInput key={num} onTap={() => handleNumpadPress(num)}>
              {num}
            </PadInput>
          ))}

          <PadInput className="border-b-0 pointer-events-none" />
          <PadInput className="border-b-0" onTap={() => handleNumpadPress(0)}>
            0
          </PadInput>

          <PadInput className="border-b-0" onTap={handleBackspace}>
            <IoBackspaceSharp className="scale-110" />
          </PadInput>
        </div>
      </div>
    </PageContainer>
  )
}

function PadInput({
  onTap,
  children,
  className,
}: PropsWithChildren<{
  onTap?: () => void
  className?: string
}>) {
  return (
    <button
      onClick={onTap}
      className={cn(
        "aspect-square grid place-items-center text-white/90 active:text-white relative z-1 border-white/10 border-r border-b nth-[3n]:border-r-0 active:bg-white/7 text-2xl",
        className
      )}
    >
      {children}
    </button>
  )
}
