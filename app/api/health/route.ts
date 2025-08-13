import { NextResponse } from "next/server"
import { testConnection } from "@/lib/database/connection"

export async function GET() {
  try {
    const dbTest = await testConnection()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbTest.success ? "connected" : "disconnected",
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
