import mysql from "mysql2/promise"

// Database configuration for VignoSaas
const dbConfig = {
  host: process.env.DB_HOST || "103.120.178.69",
  user: process.env.DB_USER || "vignosaas",
  password: process.env.DB_PASSWORD || "Dallas77!.0",
  database: process.env.DB_NAME || "VignoSaas",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
  timezone: "+00:00",
}

// Create connection pool
let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    console.log("Creating MySQL connection pool for VignoSaas database...")
    pool = mysql.createPool(dbConfig)

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("MySQL pool error:", err)
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.log("Recreating MySQL connection pool...")
        pool = null
      }
    })
  }
  return pool
}

// Test database connection
export async function testConnection() {
  try {
    const connection = await getPool().getConnection()
    await connection.ping()
    const [result] = await connection.execute("SELECT 1 as test, DATABASE() as current_db, NOW() as current_time")
    connection.release()

    const testResult = result as any[]
    return {
      success: true,
      message: "Successfully connected to VignoSaas database",
      database: testResult[0]?.current_db,
      timestamp: testResult[0]?.current_time,
      host: dbConfig.host,
      user: dbConfig.user,
    }
  } catch (error: any) {
    console.error("VignoSaas database connection failed:", error)

    let errorMessage = "Database connection failed"
    if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection refused - check if MySQL server is running"
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      errorMessage = "Access denied - check username and password"
    } else if (error.code === "ER_BAD_DB_ERROR") {
      errorMessage = "Database 'VignoSaas' does not exist"
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Host not found - check database host address"
    }

    return {
      success: false,
      message: errorMessage,
      error: error.code,
      details: error.message,
    }
  }
}

// Execute query with error handling
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await getPool().execute(query, params)
    return {
      success: true,
      data: results,
      rowCount: Array.isArray(results) ? results.length : 0,
    }
  } catch (error: any) {
    console.error("Query execution failed:", error)
    return {
      success: false,
      message: `Query failed: ${error.message}`,
      error: error.code,
      sqlState: error.sqlState,
    }
  }
}

// Execute single query (for INSERT, UPDATE, DELETE)
export async function executeSingle(query: string, params: any[] = []) {
  try {
    const [result] = await getPool().execute(query, params)
    const mysqlResult = result as mysql.ResultSetHeader

    return {
      success: true,
      insertId: mysqlResult.insertId,
      affectedRows: mysqlResult.affectedRows,
      changedRows: mysqlResult.changedRows,
    }
  } catch (error: any) {
    console.error("Single query execution failed:", error)
    return {
      success: false,
      message: `Query failed: ${error.message}`,
      error: error.code,
    }
  }
}

export default getPool
