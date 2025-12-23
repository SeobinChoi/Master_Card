import { auth } from "@/lib/auth"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireSeller() {
  const user = await requireAuth()
  if (user.role !== "SELLER" || !user.sellerApproved) {
    throw new Error("Seller access required")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required")
  }
  return user
}
