"use client"

import { useWorldAuth } from "@radish-la/world-auth"

import { TbArrowDownLeft, TbArrowUpRight } from "react-icons/tb"
import { FaCoins, FaArrowUp } from "react-icons/fa"
import { IoMdMenu } from "react-icons/io"
import { RiHome3Fill, RiMoneyDollarBoxFill } from "react-icons/ri"
import { IoInformationCircleOutline } from "react-icons/io5"
import { FaArrowsRotate } from "react-icons/fa6"

import { isDevEnv } from "@/lib/env"
import { useWithdrawModal } from "@/components/DrawerWithdraw"
import { useSentientWallet } from "@/lib/wallets"

import PageSignin from "./PageSignin"
import PageContainer from "./PageContainer"
import DialogAddress from "./components/DialogAddress"

export default function Home() {
  const { toggle } = useWithdrawModal()
  const { isConnected } = useWorldAuth()
  const { wallet } = useSentientWallet()

  // Show when not conencted or no Sentient wallet created
  const showConnectState = (!isDevEnv() && !isConnected) || !wallet
  if (showConnectState) return <PageSignin />

  return (
    <PageContainer>
      {/* Header */}
      <header className="flex items-center justify-between">
        <DialogAddress />
        <button className="p-1">
          <IoMdMenu className="text-2xl" />
        </button>
      </header>

      {/* Balance Section */}
      <section className="flex-1 flex flex-col items-center justify-start pt-16">
        <h1 className="text-6xl font-bold mb-4">$0.2397</h1>
        <div className="flex items-center gap-4">
          <button className="bg-sw-green/20 hover:bg-sw-green/30 backdrop-blur-sm rounded-full pl-4 pr-3 py-1.5 flex items-center gap-2 transition-colors">
            <span className="text-sw-green font-medium">$0 earned</span>
            <IoInformationCircleOutline className="text-sw-green text-xl" />
          </button>

          <button className="text-white/60">Add funds +</button>
        </div>

        {/* Action Buttons */}
        <div className="grid mt-18 grid-cols-4 gap-2 w-full max-w-sm">
          <button
            onClick={toggle}
            className="bg-sw-yellow text-black backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center"
          >
            <figure className="size-9 grid place-items-center">
              <TbArrowUpRight className="text-3xl" />
            </figure>
            <span className="text-xs font-semibold">Send</span>
          </button>

          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center hover:bg-white/15 transition-colors">
            <figure className="size-9 grid place-items-center">
              <TbArrowDownLeft className="text-3xl" />
            </figure>
            <span className="text-xs font-semibold">Receive</span>
          </button>

          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center hover:bg-white/15 transition-colors">
            <figure className="size-9 grid place-items-center">
              <FaArrowsRotate className="text-xl" />
            </figure>
            <span className="text-xs font-semibold">Convert</span>
          </button>

          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center hover:bg-white/15 transition-colors">
            <figure className="size-9 grid place-items-center">
              <RiMoneyDollarBoxFill className="text-xl scale-125" />
            </figure>
            <span className="text-xs font-semibold whitespace-nowrap">
              Earn
            </span>
          </button>
        </div>

        {/* Transactions Section */}
        <div className="w-full mt-8 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Latest Activity</h2>
            <button className="text-sm underline">View all</button>
          </div>

          {/* Transaction Item */}
          <button className="flex w-full text-left border border-white/3 items-center gap-4 p-4 rounded-xl bg-white/6 hover:bg-white/8 transition-colors">
            <div className="w-12 h-12 rounded-full bg-sw-red/10 flex items-center justify-center">
              <TbArrowUpRight className="text-sw-red text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Sent</h3>
              <p className="text-white/60 text-sm">Completed · 10 months</p>
            </div>

            <div className="text-xl px-1 font-semibold">$0.02</div>
          </button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <nav className="flex max-w-md mx-auto items-center justify-around px-4 pt-6 border-t rounded-t-[3rem] border-white/15 pb-safe-bottom bg-black/80 backdrop-blur-md">
          <button className="grid place-items-center gap-1">
            <figure className="size-6 grid place-items-center">
              <RiHome3Fill className="text-2xl scale-110" />
            </figure>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={toggle}
            className="flex -top-2 flex-col items-center gap-1 relative"
          >
            <div className="size-12 -top-1 bg-sw-yellow text-black rounded-full flex items-center justify-center absolute">
              <FaArrowUp className="text-xl" />
            </div>
            <span className="text-xs font-medium mt-12 text-white/60">
              Send
            </span>
          </button>

          <button className="grid place-items-center gap-1">
            <figure className="size-6 grid place-items-center place-content-center">
              <FaCoins className="text-2xl" />
            </figure>
            <span className="text-xs font-medium text-white/60">Assets</span>
          </button>
        </nav>
      </div>
    </PageContainer>
  )
}
