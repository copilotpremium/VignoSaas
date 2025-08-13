import { getConnection } from "@/lib/database/connection"
import fs from "fs"
import path from "path"

async function setupDatabase() {
  console.log("🚀 Setting up VignoSaas database...")

  try {
    const connection = await getConnection()

    // Read and execute SQL scripts in order
    const scriptsDir = path.join(process.cwd(), "scripts", "mysql")
    const scripts = ["01_create_tables.sql", "02_create_functions.sql", "03_seed_data.sql", "04_create_super_admin.sql"]

    for (const scriptFile of scripts) {
      const scriptPath = path.join(scriptsDir, scriptFile)

      if (fs.existsSync(scriptPath)) {
        console.log(`📄 Executing ${scriptFile}...`)

        const sql = fs.readFileSync(scriptPath, "utf8")
        const statements = sql.split(";").filter((stmt) => stmt.trim())

        for (const statement of statements) {
          if (statement.trim()) {
            await connection.execute(statement)
          }
        }

        console.log(`✅ ${scriptFile} executed successfully`)
      } else {
        console.log(`⚠️  ${scriptFile} not found, skipping...`)
      }
    }

    connection.release()
    console.log("🎉 VignoSaas database setup completed!")
  } catch (error: any) {
    console.error("❌ Database setup failed:", error.message)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default setupDatabase
