import { Chain, createPublicClient, erc20Abi, formatUnits, http } from "viem"
import { address, createSolanaRpc } from "@solana/kit"
import { Provider } from "fuels"

import { ZERO } from "./constants"

export type BalanceResult = {
  address: string
  decimals: number
  balance: bigint
  symbol?: string
  formattedBalance: string
}

export type ChainType = "EVM" | "SOLANA" | "FUEL"

export const fetchTokenBalances = async (
  rpcData: {
    chainType: ChainType
    rpcURL: string
    chainConfig?: Chain | null
  },
  ownerAddress: string,
  tokens: {
    address: string
    symbol?: string
    decimals: number
    isNative?: boolean
  }[]
): Promise<BalanceResult[]> => {
  if (rpcData.chainType === "EVM") {
    const client = createPublicClient({
      chain: rpcData.chainConfig ?? undefined,
      transport: http(rpcData.rpcURL),
    })

    const result = await client.multicall({
      contracts: tokens.map((token) => ({
        address: token.address as any,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [ownerAddress],
      })),
    })

    return (await Promise.all(
      tokens.map(async ({ address, decimals, symbol, isNative }, index) => {
        const balance = isNative
          ? await client.getBalance({
              address: ownerAddress as any,
            })
          : BigInt(result[index]?.result || ZERO)

        return {
          address,
          decimals,
          balance,
          symbol,
          formattedBalance: formatUnits(balance, decimals),
        }
      })
    )) as BalanceResult[]
  }

  if (rpcData.chainType === "SOLANA") {
    const rpc = createSolanaRpc(rpcData.rpcURL)
    const owner = address(ownerAddress)

    return await Promise.all(
      tokens.map(
        async ({ address: tokenAddress, decimals, symbol, isNative }) => {
          let balance = ZERO

          if (isNative) {
            const res = await rpc.getBalance(owner).send()
            if (res?.value) balance = BigInt(res.value)
          } else {
            try {
              const tokenData = await rpc
                .getAccountInfo(address(tokenAddress))
                .send()

              const programId = tokenData.value?.owner
              if (!programId) throw new Error("ProgramIdNotFound")
              const res = await rpc
                .getTokenAccountsByOwner(
                  owner,
                  {
                    programId,
                    mint: address(tokenAddress),
                  },
                  {
                    encoding: "jsonParsed",
                  }
                )
                .send()

              const result =
                res?.value?.at(0)?.account?.data?.parsed?.info?.tokenAmount
                  ?.amount
              if (result) balance = BigInt(result)
            } catch (_) {}
          }

          return {
            address: tokenAddress,
            symbol,
            formattedBalance: formatUnits(balance, decimals),
            decimals,
            balance,
          } satisfies BalanceResult
        }
      )
    )
  }

  const fuelProvider = new Provider(rpcData.rpcURL)

  // Else we assume FUEL
  return await Promise.all(
    tokens.map(async ({ address, decimals, symbol }) => {
      const balance = await fuelProvider.getBalance(ownerAddress, address)
      const balanceBigInt = BigInt(balance.toString())
      return {
        address,
        decimals,
        symbol,
        balance: balanceBigInt,
        formattedBalance: formatUnits(balanceBigInt, decimals),
      } satisfies BalanceResult
    })
  )
}
