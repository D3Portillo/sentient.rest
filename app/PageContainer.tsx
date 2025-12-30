import type { PropsWithChildren } from "react"
import { cn } from "./lib/utils"

export default function PageContainer({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <main
      className={cn(
        "flex overflow-auto max-w-md mx-auto p-4 pb-20 flex-col h-dvh",
        className
      )}
    >
      {children}
    </main>
  )
}
