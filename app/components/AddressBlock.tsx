import type { Address } from "viem"
import { cn } from "@/lib/utils"

interface AddressBlockProps {
  address?: Address
  className?: string
}

export default function AddressBlock({
  address,
  className,
}: AddressBlockProps) {
  const { from, to } = addressToGradient(address)

  return (
    <figure
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${from}, ${to})`,
      }}
      className={cn("size-6 rounded-full", className)}
    />
  )
}

function addressToGradient(address?: Address) {
  if (!address) {
    // Default gradient if no address is provided
    return { from: "hsl(160, 70%, 50%)", to: "hsl(210, 70%, 50%)" }
  }

  // Use different parts of the address to generate two hue values
  const hash1 = parseInt(address.slice(2, 10), 16)
  const hash2 = parseInt(address.slice(-8), 16)

  // Map to hue values (0-360deg)
  return {
    from: `hsl(${hash1 % 360}, 70%, 50%)`,
    to: `hsl(${hash2 % 360}, 70%, 50%)`,
  }
}
