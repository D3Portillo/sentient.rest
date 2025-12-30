"use client"

import { useWorldAuth } from "@radish-la/world-auth"
import { useSentientWallet } from "@/lib/wallets"
import { useTokenPrices, useAccountBalances } from "@/lib/prices"

import PageContainer from "@/app/PageContainer"
import { isDevEnv } from "@/lib/env"
import { localizeNumber } from "@/lib/numbers"

export default function PageAssets() {
  const { isConnected } = useWorldAuth()
  const { wallet } = useSentientWallet()

  const { balances } = useAccountBalances({
    evm: wallet?.evm.address,
    sol: wallet?.solana.address,
    fuel: wallet?.fuel.address,
  })

  const { getTokenPrice } = useTokenPrices()

  return (
    <PageContainer>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque
        repellendus inventore distinctio sapiente illum numquam error tenetur
        molestiae maxime voluptates tempora autem expedita quasi est deserunt
        minus doloribus, id ipsa.
      </p>
    </PageContainer>
  )
}
