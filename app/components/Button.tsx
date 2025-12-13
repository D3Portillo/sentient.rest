import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
}
export default function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "transition-colors shrink-0",
        "active:scale-98 font-semibold flex gap-4 items-center justify-center h-13 px-5 rounded-lg",
        variant === "primary" &&
          "bg-sw-yellow text-black hover:bg-sw-yellow/90",
        variant === "secondary" &&
          "bg-white/15 text-white border border-white/15 hover:bg-white/20",
        className
      )}
    >
      {children}
    </button>
  )
}
