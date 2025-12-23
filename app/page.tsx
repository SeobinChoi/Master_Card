import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CardStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const featuredCards = await prisma.card.findMany({
    where: { status: CardStatus.PUBLISHED },
    include: {
      seller: { select: { name: true } },
      _count: { select: { certifications: { where: { verified: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Card Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Discover curated knowledge products from expert creators.
            Learn from structured cards, verified solutions, and proven expertise.
          </p>
          <div className="flex gap-4">
            <Link
              href="/cards"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Browse Cards
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Cards</h2>
          <Link href="/cards" className="text-blue-600 hover:text-blue-800 font-medium">
            View all &rarr;
          </Link>
        </div>

        {featuredCards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards available yet</h3>
            <p className="text-gray-600">Check back soon for new knowledge products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCards.map((card) => (
              <Link key={card.id} href={`/cards/${card.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition h-full">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {card.type.replace(/_/g, " ")}
                      </span>
                      {card._count.certifications > 0 && (
                        <span className="text-green-600 text-xs font-medium">Verified</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.summary}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{card.seller.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
