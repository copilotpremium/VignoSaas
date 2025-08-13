import jwt from "jsonwebtoken"
import { getUserById, getUserByEmail, verifyPassword } from "../database/queries"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long")
}

export interface AuthUser {
  id: number
  email: string
  full_name: string
  role: string
  hotel_id?: number
  hotel_name?: string
  hotel_slug?: string
}

export interface JWTPayload {
  userId: number
  email: string
  role: string
  hotel_id?: number
  iat?: number
  exp?: number
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    hotel_id: user.hotel_id,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

// Authenticate user with email and password
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await getUserByEmail(email)
    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return null
    }

    // Return user without password hash
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      hotel_id: user.hotel_id,
      hotel_name: user.hotel_name,
      hotel_slug: user.hotel_slug,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

// Get user from JWT token
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const user = await getUserById(payload.userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      hotel_id: user.hotel_id,
      hotel_name: user.hotel_name,
      hotel_slug: user.hotel_slug,
    }
  } catch (error) {
    console.error("Get user from token error:", error)
    return null
  }
}

// Role-based authorization
export function hasRole(user: AuthUser, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }
  return user.role === requiredRole
}

export function isSuperAdmin(user: AuthUser): boolean {
  return user.role === "super_admin"
}

export function isHotelOwner(user: AuthUser): boolean {
  return user.role === "hotel_owner"
}

export function isHotelStaff(user: AuthUser): boolean {
  return user.role === "hotel_staff"
}

export function canAccessHotel(user: AuthUser, hotelId: number): boolean {
  // Super admin can access any hotel
  if (isSuperAdmin(user)) {
    return true
  }

  // Hotel owner/staff can only access their own hotel
  return user.hotel_id === hotelId
}

// Generate secure random token for password reset, etc.
export function generateSecureToken(): string {
  return jwt.sign({ random: Math.random() }, JWT_SECRET, { expiresIn: "1h" })
}
