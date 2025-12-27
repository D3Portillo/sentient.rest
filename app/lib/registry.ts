import { zeroAddress } from "viem"
import { arbitrum, base, optimism, worldchain } from "viem/chains"

const DEPOSIT_CHAINS = {
  WORLD: {
    name: "Worldchain",
    iconImage: "/chains/world.png",
    rpcURL: "https://worldchain.drpc.org",
    chainType: "EVM",
    chainConfig: worldchain,
  },
  BASE: {
    name: "Base",
    iconImage: "/chains/base.png",
    rpcURL: "https://base.meowrpc.com",
    chainType: "EVM",
    chainConfig: base,
  },
  ARBITRUM: {
    name: "Arbitrum",
    iconImage: "/chains/arbitrum.png",
    rpcURL: "https://arbitrum.drpc.org",
    chainType: "EVM",
    chainConfig: arbitrum,
  },
  OPTIMISM: {
    name: "Optimism",
    iconImage: "/chains/optimism.png",
    rpcURL: "https://0xrpc.io/op",
    chainType: "EVM",
    chainConfig: optimism,
  },
  FUEL: {
    name: "Fuel",
    iconImage: "/chains/fuel.png",
    rpcURL: "https://mainnet.fuel.network/v1/graphql",
    chainType: "FUEL",
    chainConfig: null,
  },
  SOLANA: {
    name: "Solana",
    iconImage: "/chains/solana.png",
    rpcURL:
      "https://solana-mainnet.g.alchemy.com/v2/TydhRO71t-iaLkFdNDoQ_eIcd9TgKv0Q",
    chainType: "SOLANA",
    chainConfig: null,
  },
} as const

export type DepositChain = keyof typeof DEPOSIT_CHAINS

export const CHAINS_LIST = Object.entries(DEPOSIT_CHAINS).map(
  ([key, value]) => ({
    ...value,
    // Include key as DepositChainId
    id: key as DepositChain,
  })
)

export const CHAIN_WORLD = CHAINS_LIST[0]

type TokenConfig = {
  symbol: string
  name: string
  iconImage: string
  chains: Partial<
    Record<
      DepositChain,
      {
        address: string
        decimals: number
        isNative?: boolean
      }
    >
  >
}

const TOKENS: Record<string, TokenConfig> = {
  WLD: {
    symbol: "WLD",
    name: "Worldcoin",
    chains: {
      WORLD: {
        address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
        decimals: 18,
      },
      OPTIMISM: {
        address: "0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1",
        decimals: 18,
      },
    },
    iconImage: "/tokens/wld.png",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    chains: {
      ARBITRUM: {
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
      },
      BASE: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
      },
      FUEL: {
        address:
          "0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b",
        decimals: 6,
      },
      OPTIMISM: {
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        decimals: 6,
      },
      SOLANA: {
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        decimals: 6,
      },
      WORLD: {
        address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
        decimals: 6,
      },
    },
    iconImage: "/tokens/usdc.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    chains: {
      SOLANA: {
        address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        decimals: 6,
      },
      ARBITRUM: {
        address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        decimals: 6,
      },
      OPTIMISM: {
        address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        decimals: 6,
      },
      BASE: {
        address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
        decimals: 6,
      },
      FUEL: {
        address:
          "0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e",
        decimals: 6,
      },
    },
    iconImage: "/tokens/usdt.png",
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    chains: {
      SOLANA: {
        address: "So11111111111111111111111111111111111111111",
        isNative: true,
        decimals: 9,
      },
    },
    iconImage: "/tokens/sol.png",
  },
  FUEL: {
    name: "Fuel",
    symbol: "FUEL",
    iconImage: "/tokens/fuel.png",
    chains: {
      FUEL: {
        address:
          "0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82",
        decimals: 9,
      },
    },
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    chains: {
      // Native ETH (ZERO addresses)
      ARBITRUM: {
        address: zeroAddress,
        isNative: true,
        decimals: 18,
      },
      OPTIMISM: {
        address: zeroAddress,
        isNative: true,
        decimals: 18,
      },
      BASE: {
        address: zeroAddress,
        isNative: true,
        decimals: 18,
      },
      FUEL: {
        address:
          "0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07",
        isNative: true,
        decimals: 9,
      },
      WORLD: {
        address: zeroAddress,
        isNative: true,
        decimals: 18,
      },
    },
    iconImage: "/tokens/eth.png",
  },
}

export const TOKENS_LIST = Object.values(TOKENS)
export const TOKEN_WLD = TOKENS_LIST[0]
export const TOKEN_USDC = TOKENS_LIST.find((t) => t.symbol === "USDC")!

export const getTokensForChain = (chain: DepositChain) => {
  return TOKENS_LIST.filter((token) => token.chains?.[chain])
}

export const getChainsForToken = (tokenSymbol: string) => {
  const token = TOKENS[tokenSymbol]
  if (!token) return []

  return Object.entries(token.chains).map(([chainId, _]) => {
    const chain = CHAINS_LIST.find((c) => c.id === chainId)
    if (!chain) throw new Error("InvalidSymbol")
    return chain
  })
}
