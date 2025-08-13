import { NextResponse } from "next/server"
import { removeSessionCookie } from "@/lib/auth/session"

export async function POST() {
  try {
    removeSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
