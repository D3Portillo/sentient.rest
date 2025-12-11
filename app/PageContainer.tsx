import type { PropsWithChildren } from "react"
import { cn } from "./lib/utils"

export default function PageContainer({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main className={cn("flex max-w-md mx-auto p-4 flex-col h-dvh", className)}>
      {children}
    </main>
  )
}
