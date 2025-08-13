import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/database/connection"

export async function GET() {
  const startTime = Date.now()

  try {
    console.log("🔍 Testing VignoSaas database connection...")

    // Test basic connection
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          step: "connection_test",
          message: "Failed to connect to VignoSaas database",
          error: connectionTest.message,
          details: connectionTest.details,
          timestamp: new Date().toISOString(),
          duration: `${Date.now() - startTime}ms`,
        },
        { status: 500 },
      )
    }

    // Get database information
    const dbInfo = await executeQuery(`
      SELECT 
        'VignoSaas Hotel Booking System' as system_name,
        DATABASE() as current_database,
        USER() as current_user,
        NOW() as server_time,
        @@version as mysql_version
    `)

    // Check for existing tables
    const tableCheck = await executeQuery(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'VignoSaas' 
      ORDER BY TABLE_NAME
    `)

    const hasApplicationTables = tableCheck.success && Array.isArray(tableCheck.data) && tableCheck.data.length > 0

    return NextResponse.json({
      success: true,
      message: "🎉 VignoSaas database connection fully verified!",
      connection: {
        status: "✅ SUCCESS",
        message: connectionTest.message,
        database: connectionTest.database,
        host: connectionTest.host,
        user: connectionTest.user,
      },
      database_info: {
        status: "✅ SUCCESS",
        data: dbInfo.data,
      },
      tables: {
        status: hasApplicationTables ? "✅ FOUND" : "⚠️ EMPTY",
        count: Array.isArray(tableCheck.data) ? tableCheck.data.length : 0,
        tables: tableCheck.data,
      },
      performance: {
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      },
      deployment: {
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? "✅ Deployed on Vercel" : "❌ Local development",
      },
    })
  } catch (error: any) {
    console.error("❌ Database test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error during database test",
        error: error.message,
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 },
    )
  }
}
