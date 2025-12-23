import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function LibraryPage() {
  try {
    const user = await requireAuth()

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        card: {
          include: {
            seller: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
            <p className="mt-2 text-gray-600">Access your purchased knowledge cards</p>
          </div>

          {purchases.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cards in your library</h3>
              <p className="text-gray-600 mb-4">Browse the marketplace to find valuable knowledge products</p>
              <Link
                href="/cards"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Cards
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map(({ card }) => (
                <Link key={card.id} href={`/library/${card.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition h-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {card.type.replace(/_/g, " ")}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          v{card.version}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.summary}</p>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">{card.seller.name}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                      <span className="text-blue-600 font-medium text-sm">Read Card &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
