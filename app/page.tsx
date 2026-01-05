"use client"

import { TbArrowDownLeft, TbArrowUpRight } from "react-icons/tb"
import { IoMdMenu } from "react-icons/io"
import { RiMoneyDollarBoxFill } from "react-icons/ri"
import { IoInformationCircleOutline } from "react-icons/io5"
import { FaArrowsRotate } from "react-icons/fa6"

import { useWithdrawModal } from "@/components/DrawerWithdraw"
import { useTopUpModal } from "@/components/DrawerTopUp"
import { useDepositModal } from "@/components/DrawerDeposit"
import { useTokenPrices, useAccountBalances } from "@/lib/prices"

import { localizeNumber } from "@/lib/numbers"

import DialogAddress from "@/components/DialogAddress"
import PageContainer from "./PageContainer"
import Link from "next/link"

export default function Home() {
  const { show: showWithdrawModal } = useWithdrawModal()
  const { show: showDepositModal } = useDepositModal()
  const { toggle: toggleTopUp } = useTopUpModal()

  const { balances } = useAccountBalances()

  const { getTokenPrice } = useTokenPrices()

  const allBalancesInUSD = Object.values(balances || {})
    .flat()
    .reduce((acc, { formattedBalance, symbol: tokenSymbol }) => {
      if (!tokenSymbol) return acc
      return acc + getTokenPrice(tokenSymbol) * Number(formattedBalance)
    }, 0)

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
        <Link className="active:scale-98" href="/assets">
          <h1 className="text-6xl font-bold mb-4">
            ${localizeNumber(allBalancesInUSD)}
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <button className="bg-sw-green/20 hover:bg-sw-green/30 backdrop-blur-sm rounded-full pl-3 pr-2 py-1 flex items-center gap-2 transition-colors">
            <span className="text-sw-green font-medium">$0 earned</span>
            <IoInformationCircleOutline className="text-sw-green text-xl" />
          </button>

          <button onClick={toggleTopUp} className="text-white/60">
            Add funds +
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid mt-18 grid-cols-4 gap-2 w-full max-w-sm">
          <button
            onClick={() => showWithdrawModal()}
            className="bg-sw-yellow text-black backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center"
          >
            <figure className="size-9 grid place-items-center">
              <TbArrowUpRight className="text-3xl" />
            </figure>
            <span className="text-xs font-semibold">Send</span>
          </button>

          <button
            onClick={() => showDepositModal()}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 gap-1 flex flex-col items-center justify-center hover:bg-white/15 transition-colors"
          >
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
    </PageContainer>
  )
}
