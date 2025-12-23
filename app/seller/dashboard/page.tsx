import { redirect } from "next/navigation"
import { requireSeller } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function SellerDashboard() {
  try {
    const user = await requireSeller()

    const cards = await prisma.card.findMany({
      where: { sellerId: user.id },
      include: {
        _count: {
          select: {
            purchases: true,
            reviews: true,
            certifications: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your knowledge cards</p>
            </div>
            <Link
              href="/seller/cards/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Create New Card
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
                <p className="text-gray-600 mb-4">Create your first knowledge card to get started</p>
                <Link
                  href="/seller/cards/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Card
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cards.map((card) => (
                  <li key={card.id}>
                    <Link
                      href={`/seller/cards/${card.id}/edit`}
                      className="block hover:bg-gray-50 transition"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{card.summary}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                card.status === "PUBLISHED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {card.status}
                              </span>
                              <span>{card.type.replace(/_/g, " ")}</span>
                              <span>v{card.version}</span>
                            </div>
                          </div>
                          <div className="ml-6 flex items-center gap-6 text-sm text-gray-500">
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{card._count.purchases}</div>
                              <div>Purchases</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{card._count.reviews}</div>
                              <div>Reviews</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-gray-900">{card._count.certifications}</div>
                              <div>Certifications</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
