import { generateJWT } from "@/lib/session"

export async function POST(request: Request) {
  const { path, headers } = await generateJWT(
    "https://api.cdp.coinbase.com/platform/v2/onramp/sessions"
  )

  const req = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(await request.json()),
  })

  return Response.json(await req.json())
}
