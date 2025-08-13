import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VignoSaas - Hotel Booking Management Platform",
  description:
    "Complete multi-tenant SaaS platform for hotel booking and management with VignoSaas database integration",
  keywords: "hotel booking, hotel management, SaaS platform, multi-tenant, VignoSaas",
  authors: [{ name: "VignoSaas Team" }],
  openGraph: {
    title: "VignoSaas Hotel Booking Platform",
    description: "Complete hotel management solution with booking system, guest CRM, and analytics",
    type: "website",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
