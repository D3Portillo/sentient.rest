import { cn } from "@/lib/utils"

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 389 498"
    fill="none"
  >
    <path fill="currentColor" d="M0 0v259h129V129h259V0z" />
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M259 239h129v259H0V368h259z"
      clip-rule="evenodd"
    />
  </svg>
)

export const Spinner = ({
  themeSize = "size-7",
}: {
  themeSize?: "size-7" | "size-5"
}) => {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid border-current border-r-transparent",
        themeSize === "size-5" ? "border-3" : "border-4 ",
        themeSize
      )}
    />
  )
}
