import { createPublicClient, http } from "viem"
import { worldchain } from "viem/chains"

export const clientWorldchain = createPublicClient({
  chain: worldchain,
  transport: http(),
})

export interface ActionLinkProps {
  actionAppId: string
  path: string
  params?: Record<string, string>
}

const MAIN_ACTION_URL = "https://worldcoin.org/mini-app"
export function getMiniAppActionLink({
  actionAppId,
  path,
  params = {},
}: ActionLinkProps) {
  let appPath = path

  const paramEntries = Object.entries(params)
  if (paramEntries.length) {
    appPath += `?${paramEntries
      .map(([key, value]) => `${key}=${value}`)
      .join("&")}`
  }

  return `${MAIN_ACTION_URL}?app_id=${actionAppId}&path=${encodeURIComponent(
    appPath
  )}`
}
