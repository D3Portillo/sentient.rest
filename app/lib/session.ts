/**
 * Session Token API utilities for secure initialization
 */
import { generateJwt } from "@coinbase/cdp-sdk/auth"

/**
 * Generates a JWT token for CDP API authentication using the CDP SDK
 * @param path The API endpoint path for which the JWT is being generated
 * @returns Promise of signed JWT token
 */
export async function generateJWT(
  path:
    | "https://api.developer.coinbase.com/onramp/v1/token"
    | "https://api.cdp.coinbase.com/platform/v2/onramp/sessions"
): Promise<{ token: string; path: string; headers?: Record<string, string> }> {
  const requestURL = new URL(path)
  const requestMethod = "POST"

  // Get API credentials from environment variables
  const keyName = process.env.CDP_KEY_ID!
  const keySecret = process.env.CDP_SECRET!

  try {
    // Use the CDP SDK to generate the JWT
    const token = await generateJwt({
      apiKeyId: keyName,
      apiKeySecret: keySecret,
      requestMethod: requestMethod,
      requestHost: requestURL.host,
      requestPath: requestURL.pathname,
      expiresIn: 120, // optional (defaults to 120 seconds)
    })

    return {
      token,
      path,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  } catch (error) {
    console.error("Error generating JWT:", error)
    throw error
  }
}
