import { prisma } from "@/lib/prisma"
import { CardStatus, CardType } from "@prisma/client"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search : ""
  const type = typeof params.type === "string" ? params.type : undefined
  const category = typeof params.category === "string" ? params.category : undefined

  const user = await getCurrentUser()

  const cards = await prisma.card.findMany({
    where: {
      status: CardStatus.PUBLISHED,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type: type as CardType }),
      ...(category && { category: { contains: category, mode: "insensitive" } }),
    },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          reviews: true,
          certifications: { where: { verified: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const categories = await prisma.card.findMany({
    where: { status: CardStatus.PUBLISHED },
    select: { category: true },
    distinct: ["category"],
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Cards</h1>
          <p className="mt-2 text-gray-600">Discover knowledge products from expert creators</p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <form action="/cards" method="get">
              <input
                type="text"
                name="search"
                id="search"
                defaultValue={search}
                placeholder="Search cards..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </form>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <form action="/cards" method="get">
              <select
                name="type"
                id="type"
                defaultValue={type}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {Object.values(CardType).map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </form>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <form action="/cards" method="get">
              <select
                name="category"
                id="category"
                defaultValue={category}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </form>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link key={card.id} href={`/cards/${card.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {card.type.replace(/_/g, " ")}
                      </span>
                      {card._count.certifications > 0 && (
                        <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{card.summary}</p>
                    <div className="text-sm text-gray-500 mb-2">
                      <span className="font-medium">{card.seller.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">{card.category}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">v{card.version}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
                    <span>{card._count.reviews} reviews</span>
                    <span className="text-blue-600 font-medium">View Details &rarr;</span>
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
