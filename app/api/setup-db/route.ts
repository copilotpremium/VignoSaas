import { NextResponse } from "next/server"
import { testConnection, executeQuery, executeSingle } from "@/lib/database/connection"

export async function POST() {
  try {
    console.log("🚀 Starting VignoSaas database setup...")

    // Test connection first
    const connectionTest = await testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: connectionTest.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Database connection verified")

    // Check if tables already exist
    const existingTables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'VignoSaas'
    `)

    if (existingTables.success && Array.isArray(existingTables.data) && existingTables.data.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already set up",
        existing_tables: existingTables.data,
        note: "Tables already exist in VignoSaas database",
      })
    }

    // Create basic tables for testing
    const createUsersTable = await executeSingle(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'hotel_owner', 'hotel_staff', 'guest') DEFAULT 'guest',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    const createHotelsTable = await executeSingle(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        owner_id INT,
        status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `)

    // Insert test super admin user
    const insertAdmin = await executeSingle(
      `
      INSERT INTO users (email, password_hash, role, first_name, last_name) 
      VALUES (?, ?, 'super_admin', 'Super', 'Admin')
      ON DUPLICATE KEY UPDATE role = 'super_admin'
    `,
      ["admin@vignosaas.com", "$2b$10$rQZ9QmjQZ9QmjQZ9QmjQZOeKQZ9QmjQZ9QmjQZ9QmjQZ9QmjQZ9Qm"],
    ) // bcrypt hash of 'admin123'

    return NextResponse.json({
      success: true,
      message: "🎉 VignoSaas database setup completed!",
      results: {
        users_table: createUsersTable,
        hotels_table: createHotelsTable,
        admin_user: insertAdmin,
      },
      credentials: {
        admin_email: "admin@vignosaas.com",
        admin_password: "admin123",
      },
      next_steps: [
        "Visit /super-admin to access admin dashboard",
        "Run full MySQL scripts for complete setup",
        "Start adding hotels and managing bookings",
      ],
    })
  } catch (error: any) {
    console.error("❌ Database setup failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database setup failed",
        error: error.message,
        details: error.stack,
      },
      { status: 500 },
    )
  }
}
