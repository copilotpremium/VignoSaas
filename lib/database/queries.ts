import { executeQuery, executeSingle } from "./connection"
import bcrypt from "bcryptjs"

// User Management
export async function createUser(userData: {
  email: string
  password: string
  full_name: string
  role?: string
  hotel_id?: number
}) {
  const hashedPassword = await bcrypt.hash(userData.password, 12)

  const query = `
    INSERT INTO users (email, password_hash, full_name, role, hotel_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `

  const result = await executeSingle(query, [
    userData.email,
    hashedPassword,
    userData.full_name,
    userData.role || "guest",
    userData.hotel_id || null,
  ])

  return result.insertId
}

export async function getUserByEmail(email: string) {
  const query = `
    SELECT u.*, h.name as hotel_name, h.slug as hotel_slug
    FROM users u
    LEFT JOIN hotels h ON u.hotel_id = h.id
    WHERE u.email = ? AND u.deleted_at IS NULL
  `

  const users = await executeQuery(query, [email])
  return users[0] || null
}

export async function getUserById(id: number) {
  const query = `
    SELECT u.*, h.name as hotel_name, h.slug as hotel_slug
    FROM users u
    LEFT JOIN hotels h ON u.hotel_id = h.id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `

  const users = await executeQuery(query, [id])
  return users[0] || null
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

// Hotel Management
export async function createHotel(hotelData: {
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  owner_id: number
  subscription_plan_id?: number
}) {
  const query = `
    INSERT INTO hotels (name, slug, description, address, phone, email, owner_id, subscription_plan_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
  `

  const result = await executeSingle(query, [
    hotelData.name,
    hotelData.slug,
    hotelData.description || null,
    hotelData.address || null,
    hotelData.phone || null,
    hotelData.email || null,
    hotelData.owner_id,
    hotelData.subscription_plan_id || 1, // Default to Free plan
  ])

  return result.insertId
}

export async function getHotelBySlug(slug: string) {
  const query = `
    SELECT h.*, sp.name as plan_name, sp.max_rooms, sp.features,
           u.full_name as owner_name, u.email as owner_email
    FROM hotels h
    LEFT JOIN subscription_plans sp ON h.subscription_plan_id = sp.id
    LEFT JOIN users u ON h.owner_id = u.id
    WHERE h.slug = ? AND h.deleted_at IS NULL
  `

  const hotels = await executeQuery(query, [slug])
  return hotels[0] || null
}

export async function getHotelsByOwnerId(ownerId: number) {
  const query = `
    SELECT h.*, sp.name as plan_name, sp.max_rooms
    FROM hotels h
    LEFT JOIN subscription_plans sp ON h.subscription_plan_id = sp.id
    WHERE h.owner_id = ? AND h.deleted_at IS NULL
    ORDER BY h.created_at DESC
  `

  return executeQuery(query, [ownerId])
}

export async function getAllHotels() {
  const query = `
    SELECT h.*, sp.name as plan_name, u.full_name as owner_name,
           (SELECT COUNT(*) FROM rooms r WHERE r.hotel_id = h.id AND r.deleted_at IS NULL) as room_count,
           (SELECT COUNT(*) FROM bookings b WHERE b.hotel_id = h.id AND b.status = 'confirmed') as booking_count
    FROM hotels h
    LEFT JOIN subscription_plans sp ON h.subscription_plan_id = sp.id
    LEFT JOIN users u ON h.owner_id = u.id
    WHERE h.deleted_at IS NULL
    ORDER BY h.created_at DESC
  `

  return executeQuery(query)
}

// Room Management
export async function createRoomType(roomTypeData: {
  hotel_id: number
  name: string
  description?: string
  base_price: number
  max_occupancy: number
  amenities?: string[]
}) {
  const query = `
    INSERT INTO room_types (hotel_id, name, description, base_price, max_occupancy, amenities, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `

  const result = await executeSingle(query, [
    roomTypeData.hotel_id,
    roomTypeData.name,
    roomTypeData.description || null,
    roomTypeData.base_price,
    roomTypeData.max_occupancy,
    JSON.stringify(roomTypeData.amenities || []),
  ])

  return result.insertId
}

export async function getRoomTypesByHotelId(hotelId: number) {
  const query = `
    SELECT rt.*,
           (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id AND r.deleted_at IS NULL) as room_count
    FROM room_types rt
    WHERE rt.hotel_id = ? AND rt.deleted_at IS NULL
    ORDER BY rt.created_at DESC
  `

  return executeQuery(query, [hotelId])
}

export async function createRoom(roomData: {
  hotel_id: number
  room_type_id: number
  room_number: string
  floor?: number
  status?: string
}) {
  const query = `
    INSERT INTO rooms (hotel_id, room_type_id, room_number, floor, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `

  const result = await executeSingle(query, [
    roomData.hotel_id,
    roomData.room_type_id,
    roomData.room_number,
    roomData.floor || null,
    roomData.status || "available",
  ])

  return result.insertId
}

export async function getRoomsByHotelId(hotelId: number) {
  const query = `
    SELECT r.*, rt.name as room_type_name, rt.base_price, rt.max_occupancy
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.hotel_id = ? AND r.deleted_at IS NULL
    ORDER BY r.floor ASC, r.room_number ASC
  `

  return executeQuery(query, [hotelId])
}

// Booking Management
export async function createBooking(bookingData: {
  hotel_id: number
  room_id: number
  guest_id: number
  check_in_date: string
  check_out_date: string
  total_amount: number
  status?: string
  special_requests?: string
}) {
  const query = `
    INSERT INTO bookings (hotel_id, room_id, guest_id, check_in_date, check_out_date, 
                         total_amount, status, special_requests, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `

  const result = await executeSingle(query, [
    bookingData.hotel_id,
    bookingData.room_id,
    bookingData.guest_id,
    bookingData.check_in_date,
    bookingData.check_out_date,
    bookingData.total_amount,
    bookingData.status || "pending",
    bookingData.special_requests || null,
  ])

  return result.insertId
}

export async function getBookingsByHotelId(hotelId: number, limit?: number) {
  const query = `
    SELECT b.*, r.room_number, rt.name as room_type_name,
           g.full_name as guest_name, g.email as guest_email, g.phone as guest_phone
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    JOIN guests g ON b.guest_id = g.id
    WHERE b.hotel_id = ? AND b.deleted_at IS NULL
    ORDER BY b.created_at DESC
    ${limit ? `LIMIT ${limit}` : ""}
  `

  return executeQuery(query, [hotelId])
}

// Guest Management
export async function createGuest(guestData: {
  full_name: string
  email: string
  phone?: string
  address?: string
  id_number?: string
}) {
  const query = `
    INSERT INTO guests (full_name, email, phone, address, id_number, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `

  const result = await executeSingle(query, [
    guestData.full_name,
    guestData.email,
    guestData.phone || null,
    guestData.address || null,
    guestData.id_number || null,
  ])

  return result.insertId
}

export async function getGuestByEmail(email: string) {
  const query = `
    SELECT * FROM guests 
    WHERE email = ? AND deleted_at IS NULL
  `

  const guests = await executeQuery(query, [email])
  return guests[0] || null
}

// Subscription Plans
export async function getSubscriptionPlans() {
  const query = `
    SELECT * FROM subscription_plans 
    WHERE active = 1
    ORDER BY price ASC
  `

  return executeQuery(query)
}

export async function updateHotelSubscription(hotelId: number, planId: number) {
  const query = `
    UPDATE hotels 
    SET subscription_plan_id = ?, updated_at = NOW()
    WHERE id = ?
  `

  const result = await executeSingle(query, [planId, hotelId])
  return result.affectedRows > 0
}

// Dashboard Analytics
export async function getHotelDashboardStats(hotelId: number) {
  const queries = {
    totalRooms: `
      SELECT COUNT(*) as count 
      FROM rooms 
      WHERE hotel_id = ? AND deleted_at IS NULL
    `,
    totalBookings: `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE hotel_id = ? AND deleted_at IS NULL
    `,
    activeBookings: `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE hotel_id = ? AND status IN ('confirmed', 'checked_in') AND deleted_at IS NULL
    `,
    monthlyRevenue: `
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings 
      WHERE hotel_id = ? AND status = 'confirmed' 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND deleted_at IS NULL
    `,
  }

  const [totalRooms, totalBookings, activeBookings, monthlyRevenue] = await Promise.all([
    executeQuery(queries.totalRooms, [hotelId]),
    executeQuery(queries.totalBookings, [hotelId]),
    executeQuery(queries.activeBookings, [hotelId]),
    executeQuery(queries.monthlyRevenue, [hotelId]),
  ])

  return {
    totalRooms: totalRooms[0]?.count || 0,
    totalBookings: totalBookings[0]?.count || 0,
    activeBookings: activeBookings[0]?.count || 0,
    monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
  }
}

export async function getSuperAdminDashboardStats() {
  const queries = {
    totalHotels: `
      SELECT COUNT(*) as count 
      FROM hotels 
      WHERE deleted_at IS NULL
    `,
    totalUsers: `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE deleted_at IS NULL
    `,
    totalBookings: `
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE deleted_at IS NULL
    `,
    monthlyRevenue: `
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings 
      WHERE status = 'confirmed' 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
        AND deleted_at IS NULL
    `,
  }

  const [totalHotels, totalUsers, totalBookings, monthlyRevenue] = await Promise.all([
    executeQuery(queries.totalHotels),
    executeQuery(queries.totalUsers),
    executeQuery(queries.totalBookings),
    executeQuery(queries.monthlyRevenue),
  ])

  return {
    totalHotels: totalHotels[0]?.count || 0,
    totalUsers: totalUsers[0]?.count || 0,
    totalBookings: totalBookings[0]?.count || 0,
    monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
  }
}
