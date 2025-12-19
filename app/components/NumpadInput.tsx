"use client"

import type { PropsWithChildren } from "react"
import { IoBackspaceSharp } from "react-icons/io5"
import { cn } from "@/lib/utils"

interface NumpadInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  type: "pin" | "amount"
  className?: string
  error?: string
  label?: string
  placeholder?: string
}

export function NumpadInput({
  value,
  onChange,
  maxLength,
  placeholder = "0",
  type = "amount",
  error,
  label,
  className,
}: NumpadInputProps) {
  const handleNumpadPress = (digit: number) => {
    if (maxLength && value.length >= maxLength) return
    onChange(`${value}${digit}`)
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const handleDecimal = () => {
    if (type === "pin") return
    if (value.includes(".")) return
    onChange(`${value || "0"}.`)
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-72", className)}>
      {/* Display Area */}
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-xs text-white/60 text-center">{label}</label>
        )}

        {type === "pin" ? (
          // PIN dots display
          <div className="flex gap-2 justify-center">
            {Array.from({ length: maxLength || 4 }).map((_, idx) => (
              <div
                key={`pin-dot-${idx}`}
                className={cn(
                  "size-3.5 shrink-0 rounded-full border-2 transition-colors",
                  value.length > idx
                    ? "bg-white border-white"
                    : "border-white/30 bg-transparent"
                )}
              />
            ))}
          </div>
        ) : (
          // Amount display
          <div className="text-center relative z-1">
            <span className="text-5xl font-bold tabular-nums">
              ${value || placeholder}
            </span>
          </div>
        )}

        <p className="text-red-400 text-center text-xs min-h-4">
          {error ? error : null}
        </p>
      </div>

      {/* Numpad */}
      <div className="relative w-full">
        <div className="grid grid-cols-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <PadButton key={num} onTap={() => handleNumpadPress(num)}>
              {num}
            </PadButton>
          ))}

          {type === "amount" ? (
            <PadButton className="border-b-0" onTap={handleDecimal}>
              .
            </PadButton>
          ) : (
            <PadButton className="border-b-0 pointer-events-none" />
          )}

          <PadButton className="border-b-0" onTap={() => handleNumpadPress(0)}>
            0
          </PadButton>

          <PadButton className="border-b-0" onTap={handleBackspace}>
            <IoBackspaceSharp className="scale-110" />
          </PadButton>
        </div>
      </div>
    </div>
  )
}

function PadButton({
  onTap,
  children,
  className,
}: PropsWithChildren<{
  onTap?: () => void
  className?: string
}>) {
  return (
    <button
      onClick={onTap}
      className={cn(
        "aspect-square grid place-items-center text-white/90 active:text-white relative z-1 border-white/10 border-r border-b nth-[3n]:border-r-0 active:bg-white/7 text-2xl",
        className
      )}
    >
      {children}
    </button>
  )
}
