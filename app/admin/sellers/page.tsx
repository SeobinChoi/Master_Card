import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function SellersAdminPage() {
  try {
    await requireAdmin()

    const pendingSellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        sellerApproved: false,
      },
      orderBy: { createdAt: "desc" },
    })

    const approvedSellers = await prisma.user.findMany({
      where: {
        role: "SELLER",
        sellerApproved: true,
      },
      include: {
        _count: {
          select: {
            cardsCreated: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              &larr; Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Management</h1>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Approvals</h2>
            {pendingSellers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No pending seller approvals</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {pendingSellers.map((seller) => (
                    <li key={seller.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{seller.name}</h3>
                          <p className="text-sm text-gray-600">{seller.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(seller.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <form action="/api/admin/sellers" method="POST">
                            <input type="hidden" name="userId" value={seller.id} />
                            <input type="hidden" name="action" value="approve" />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                              Approve
                            </button>
                          </form>
                          <form action="/api/admin/sellers" method="POST">
                            <input type="hidden" name="userId" value={seller.id} />
                            <input type="hidden" name="action" value="reject" />
                            <button
                              type="submit"
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Approved Sellers</h2>
            {approvedSellers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No approved sellers yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {approvedSellers.map((seller) => (
                    <li key={seller.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{seller.name}</h3>
                          <p className="text-sm text-gray-600">{seller.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {seller._count.cardsCreated} cards created
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Approved
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
