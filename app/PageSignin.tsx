import { useWorldAuth } from "@radish-la/world-auth"
import { Logo } from "./components/icons"
import { FaArrowRight } from "react-icons/fa"
import PageContainer from "./PageContainer"

export default function PageSignin() {
  const { signIn } = useWorldAuth()
  return (
    <PageContainer className="items-center justify-center text-center">
      <Logo className="size-16" />

      <h1 className="mt-4 font-semibold text-lg">Sentient Wallet</h1>

      <p className="w-full text-sm max-w-72">
        Let's create or connect your wallet to get you started.
      </p>

      <button
        onClick={signIn}
        className="mt-12 active:scale-98 font-semibold bg-sw-yellow text-black flex gap-4 items-center justify-center h-11 px-5 rounded-lg"
      >
        <span>Connect Wallet</span>
        <FaArrowRight className="scale-105" />
      </button>
    </PageContainer>
  )
}
