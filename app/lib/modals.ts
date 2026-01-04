"use client"

import type { TokenConfig, ChainConfig } from "./registry"
import { atom, useAtom } from "jotai"
import { CHAIN_WORLD, TOKEN_WLD } from "./registry"

const atomData = atom(
  {} as Record<
    string,
    {
      token: TokenConfig
      chain: ChainConfig
      isOpen: boolean
    }
  >
)

export const useComposableModalState = (modalId: string) => {
  const [state, setState] = useAtom(atomData)

  const modalState = state[modalId] || {
    token: TOKEN_WLD,
    chain: CHAIN_WORLD,
    isOpen: false,
  }

  const setPartial = (newState: Partial<typeof modalState>) =>
    setState((prevState) => ({
      ...prevState,
      [modalId]: { ...modalState, ...newState },
    }))

  return {
    ...modalState,
    setToken: (token: TokenConfig) => setPartial({ token }),
    setChain: (chain: ChainConfig) => setPartial({ chain }),
    show: ({
      chain,
      token,
    }: { chain?: ChainConfig; token?: TokenConfig } = {}) =>
      // Default to Worldchain + WLD if not provided
      setPartial({
        token: token || TOKEN_WLD,
        chain: chain || CHAIN_WORLD,
        isOpen: true,
      }),
    close: () => setPartial({ isOpen: false }),
  }
}
