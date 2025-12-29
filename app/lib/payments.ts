"use client"

import {
  MiniKit,
  PayCommandInput,
  Tokens,
  tokenToDecimals,
} from "@worldcoin/minikit-js"
import { generateUUID } from "./utils"
import { Address } from "viem"

export const executePayment = async ({
  recipientAddress,
  paymentDescription,
  amount,
  token,
}: {
  paymentDescription: string
  recipientAddress: Address
  amount: number
  token: "WLD" | "USDC"
}) => {
  if (!MiniKit.isInstalled()) return null

  const uuid = generateUUID()
  const paymentToken = token === "WLD" ? Tokens.WLD : Tokens.USDC

  const payload: PayCommandInput = {
    reference: uuid,
    to: recipientAddress,
    tokens: [
      {
        symbol: paymentToken,
        token_amount: tokenToDecimals(amount, paymentToken).toString(),
      },
    ],
    description: paymentDescription,
  }

  const { finalPayload } = await MiniKit.commandsAsync.pay(payload)
  return finalPayload.status == "success" ? finalPayload : null
}
