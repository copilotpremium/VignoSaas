import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hotel, Calendar, Users, CreditCard, BarChart3, Shield, Globe, Smartphone, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hotel className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">VignoSaas</h1>
              <Badge variant="secondary">Hotel Booking Platform</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Complete Hotel Management
            <span className="text-blue-600"> SaaS Platform</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your hotel operations with our comprehensive booking management system. From reservations to
            guest management, everything you need in one platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/hotels">
              <Button size="lg" className="px-8">
                Browse Hotels
              </Button>
            </Link>
            <Link href="/api/test-db">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Test Database
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>Complete reservation system with real-time availability</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time availability
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Calendar integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Automated confirmations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Guest Management</CardTitle>
                <CardDescription>Comprehensive CRM for guest relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Guest profiles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Booking history
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Preference tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>Detailed insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Occupancy rates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Revenue tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Custom reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Subscription Billing</CardTitle>
                <CardDescription>Flexible pricing plans for every hotel size</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Multiple plans
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Automated billing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Usage tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Multi-Tenant Security</CardTitle>
                <CardDescription>Enterprise-grade security and data isolation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Role-based access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Data encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Audit logging
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>Access your hotel management anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Mobile optimized
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Touch-friendly UI
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Offline support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Built for Every Role</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Super Admin</CardTitle>
                <CardDescription>Platform management and hotel onboarding</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/super-admin">
                  <Button variant="outline" className="w-full bg-transparent">
                    Access Super Admin
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Hotel className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Hotel Owner</CardTitle>
                <CardDescription>Complete hotel and booking management</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/hotel-admin">
                  <Button variant="outline" className="w-full bg-transparent">
                    Hotel Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Guests</CardTitle>
                <CardDescription>Easy hotel search and booking experience</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/hotels">
                  <Button variant="outline" className="w-full bg-transparent">
                    Browse Hotels
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Hotel className="h-6 w-6" />
                <span className="text-xl font-bold">VignoSaas</span>
              </div>
              <p className="text-gray-400">Complete hotel management platform powered by VignoSaas database.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/hotels" className="hover:text-white">
                    Browse Hotels
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/api/test-db" className="hover:text-white">
                    System Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Management</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/super-admin" className="hover:text-white">
                    Super Admin
                  </Link>
                </li>
                <li>
                  <Link href="/hotel-admin" className="hover:text-white">
                    Hotel Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/hotel-admin/guests" className="hover:text-white">
                    Guest Management
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Database</h4>
              <ul className="space-y-2 text-gray-400">
                <li>VignoSaas MySQL</li>
                <li>103.120.178.69:3306</li>
                <li>Production Ready</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VignoSaas Hotel Booking Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
