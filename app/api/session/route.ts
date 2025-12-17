import { NextRequest, NextResponse } from "next/server"
import { generateJWT } from "@/lib/session"

// Session token request interface
export interface SessionTokenRequest {
  addresses: Array<{
    address: string
    blockchains: string[]
  }>
  assets?: string[]
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { addresses, assets } = body as SessionTokenRequest

    if (!addresses || addresses.length === 0) {
      return NextResponse.json(
        {
          error: "Addresses parameter is required",
        },
        { status: 400 }
      )
    }

    const { headers, path } = await generateJWT(
      "https://api.developer.coinbase.com/onramp/v1/token"
    )

    const requestBody = {
      addresses,
      ...(assets && { assets }),
    }

    // Make request to Coinbase API
    const response = await fetch(path, {
      headers,
      method: "POST",
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error("CDP API error:", response.status, response.statusText)
      console.error("Response body:", responseText)

      // Try to parse error as JSON
      let errorDetails
      try {
        errorDetails = JSON.parse(responseText)
      } catch {
        errorDetails = responseText
      }

      // Provide helpful error messages based on status code
      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Authentication failed",
            details:
              "Please verify your CDP API key and secret are correct. The API key should be in the format: organizations/{org_id}/apiKeys/{key_id}",
            apiError: errorDetails,
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: `CDP API error: ${response.status} ${response.statusText}`,
          details: errorDetails,
        },
        { status: response.status }
      )
    }

    // Parse successful response
    let data
    try {
      data = JSON.parse(responseText)
    } catch (error) {
      console.error("Failed to parse response:", responseText)
      return NextResponse.json(
        {
          error: "Invalid response from CDP API",
          details: responseText,
        },
        { status: 500 }
      )
    }

    console.log("Successfully generated session token")
    // Return the session token
    return NextResponse.json({
      token: data.token,
      channel_id: data.channelId || data.channel_id,
    })
  } catch (error) {
    console.error("Error generating session token:", error)
    return NextResponse.json(
      {
        error: "Failed to generate session token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
