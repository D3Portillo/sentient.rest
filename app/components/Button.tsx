import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export default function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "active:scale-98 font-semibold bg-sw-yellow text-black flex gap-4 items-center justify-center h-12 px-5 rounded-xl",
        className
      )}
    >
      {children}
    </button>
  )
}
