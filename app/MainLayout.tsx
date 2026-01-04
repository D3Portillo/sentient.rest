"use client"

import { Fragment, type PropsWithChildren } from "react"
import { useWorldAuth } from "@radish-la/world-auth"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { isDevEnv } from "@/lib/env"

import { FaCoins, FaArrowUp } from "react-icons/fa"
import { RiHome3Fill } from "react-icons/ri"

import { useWithdrawModal } from "@/components/DrawerWithdraw"
import { useSentientWallet } from "@/lib/wallets"

import PageSignin from "./PageSignin"

export default function MainLayout({ children }: PropsWithChildren) {
  const { show: showWithdrawModal } = useWithdrawModal()
  const { isConnected } = useWorldAuth()
  const { wallet } = useSentientWallet()

  const router = useRouter()
  const pathname = usePathname()
  const isAssetsPage = pathname === "/assets"

  // Show when not conencted or no Sentient wallet created
  const showConnectState = (!isDevEnv() && !isConnected) || !wallet
  if (showConnectState) return <PageSignin />

  return (
    <Fragment>
      {children}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <nav className="flex drop-shadow-[0_-1px_0_rgba(255,255,255,0.1)] relative max-w-md mx-auto items-center justify-around px-4 h-20 pb-safe-bottom bg-black">
          <div className="size-24 -top-4 pointer-events-none absolute bg-black rounded-full left-1/2 -translate-x-1/2" />

          <NavItem
            onClick={() => router.push("/")}
            icon={<RiHome3Fill className="text-2xl scale-110" />}
            isActive={!isAssetsPage}
          >
            Home
          </NavItem>

          <button
            onClick={() => showWithdrawModal()}
            className="flex drop-shadow-[0_0_20px_rgba(255,255,0,0.5)] -top-2 flex-col items-center gap-1 relative"
          >
            <div className="size-12 -top-1 bg-sw-yellow text-black rounded-full flex items-center justify-center absolute">
              <FaArrowUp className="text-xl" />
            </div>
            <span className="text-xs px-4 font-medium mt-12 text-yellow-100">
              Send
            </span>
          </button>

          <NavItem
            onClick={() => router.push("/assets")}
            isActive={isAssetsPage}
            icon={<FaCoins className="text-2xl" />}
          >
            Assets
          </NavItem>
        </nav>
      </div>
    </Fragment>
  )
}

function NavItem({
  icon,
  children,
  onClick,
  isActive,
}: PropsWithChildren<{
  icon: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}>) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid w-14 place-items-center gap-1",
        "transition-opacity",
        isActive ? "opacity-100" : "opacity-60"
      )}
    >
      <figure className="size-6 grid place-items-center">{icon}</figure>
      <span className="text-xs font-medium">{children}</span>
    </button>
  )
}
