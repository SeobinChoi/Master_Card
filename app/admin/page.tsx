import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  try {
    await requireAdmin()

    const stats = await Promise.all([
      prisma.user.count({ where: { role: "SELLER", sellerApproved: false } }),
      prisma.certification.count({ where: { verified: false } }),
      prisma.card.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
    ])

    const [pendingSellers, pendingCertifications, totalCards, totalUsers] = stats

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Published Cards</h3>
              <p className="text-3xl font-bold text-gray-900">{totalCards}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Sellers</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingSellers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Certifications</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingCertifications}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/sellers">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Seller Approvals</h2>
                <p className="text-gray-600 mb-4">Approve or reject seller applications</p>
                {pendingSellers > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {pendingSellers} pending
                  </span>
                )}
              </div>
            </Link>

            <Link href="/admin/certifications">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Certifications</h2>
                <p className="text-gray-600 mb-4">Verify user certifications</p>
                {pendingCertifications > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {pendingCertifications} pending
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
