import "./globals.css"
import type { Metadata, Viewport } from "next"

import { Inter } from "next/font/google"
import { Toaster } from "sonner"

import { AlertProvider } from "@/components/Alert"
import DrawerWithdraw from "@/components/DrawerWithdraw"
import SafeInsetProvider from "@/components/SafeInsetProvider"
import ErudaProvider from "@/components/ErudaProdiver"

import DrawerTopUp from "@/components/DrawerTopUp"
import DrawerBalances from "@/components/DrawerBalances"
import DrawerDeposit from "@/components/DrawerDeposit"

import WorldProvider from "./WorldProvider"
import MainLayout from "./MainLayout"

const nextFont = Inter({
  subsets: [],
  display: "fallback",
  adjustFontFallback: true,
  preload: true,
  weight: ["400", "500", "700", "800"],
})

export const metadata: Metadata = {
  title: "Sentient Wallet - An abstracted wallet for humans",
  description:
    "The best human-powered multi-chain wallet for World App. Swap, bridge and earn yield on multiple chains all in one place.",
  metadataBase: new URL("https://sentient.rest"),
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nextFont.className} antialiased`}>
        <Toaster
          swipeDirections={["left", "right", "bottom", "top"]}
          theme="light"
          toastOptions={{
            classNames: {
              toast: "rounded-full! mt-12 py-3! pl-5!",
              title: "font-bold!",
            },
          }}
          position="top-center"
        />
        <AlertProvider />

        <WorldProvider>
          <ErudaProvider>
            <SafeInsetProvider>
              <DrawerWithdraw />
              <DrawerDeposit />
              <DrawerBalances />
              <DrawerTopUp />
              <MainLayout>{children}</MainLayout>
            </SafeInsetProvider>
          </ErudaProvider>
        </WorldProvider>
      </body>
    </html>
  )
}
