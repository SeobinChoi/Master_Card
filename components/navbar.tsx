"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname?.startsWith("/login")) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Card Marketplace
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/cards"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Cards
              </Link>
              {session?.user && (
                <Link
                  href="/library"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Library
                </Link>
              )}
              {session?.user?.role === "SELLER" && session?.user?.sellerApproved && (
                <Link
                  href="/seller/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Seller Dashboard
                </Link>
              )}
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
