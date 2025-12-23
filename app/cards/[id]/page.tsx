import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { extractTableOfContents } from "@/lib/card-validation"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const card = await prisma.card.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          sellerApproved: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      certifications: {
        where: { verified: true },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      updates: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: {
          reviews: true,
          certifications: { where: { verified: true } },
          purchases: true,
        },
      },
    },
  })

  if (!card) {
    notFound()
  }

  const hasPurchased = user
    ? await prisma.purchase.findUnique({
        where: {
          userId_cardId: {
            userId: user.id,
            cardId: card.id,
          },
        },
      })
    : null

  const toc = extractTableOfContents(card.markdownContent)
  const averageRating =
    card.reviews.length > 0
      ? card.reviews.reduce((sum, r) => sum + r.rating, 0) / card.reviews.length
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {card.type.replace(/_/g, " ")}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                  {card.category}
                </span>
                {card._count.certifications > 0 && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
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

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{card.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{card.summary}</p>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{card.seller.name}</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500">({card._count.reviews} reviews)</span>
                  </div>
                )}
                <span>{card._count.purchases} purchases</span>
                <span>v{card.version}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contents</h2>
              {hasPurchased ? (
                <p className="text-gray-600 mb-4">
                  You own this card. <Link href={`/library/${card.id}`} className="text-blue-600 hover:underline">View in your library</Link>
                </p>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Preview only shows table of contents. Purchase to access full content.
                  </p>
                </div>
              )}
              <ul className="space-y-2">
                {toc.map((heading, i) => (
                  <li key={i} className="text-gray-700 flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {heading}
                  </li>
                ))}
              </ul>
            </div>

            {card.updates.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates</h2>
                <div className="space-y-4">
                  {card.updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-600">{update.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {card.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Verified Certifications</h2>
                <div className="space-y-6">
                  {card.certifications.map((cert) => (
                    <div key={cert.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-gray-900">{cert.user.name}</span>
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div>
                          <span className="font-medium">Problem: </span>
                          {cert.problemSolved}
                        </div>
                        <div>
                          <span className="font-medium">How used: </span>
                          {cert.howUsed}
                        </div>
                        <div>
                          <span className="font-medium">Result: </span>
                          {cert.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {card.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
                <div className="space-y-6">
                  {card.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{review.user.name}</span>
                          {review.title && <h3 className="font-semibold text-gray-800 mt-1">{review.title}</h3>}
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Get This Card</h3>

              {hasPurchased ? (
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <p className="text-green-800 text-sm font-medium">You own this card</p>
                  </div>
                  <Link
                    href={`/library/${card.id}`}
                    className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 font-medium"
                  >
                    View in Library
                  </Link>
                </div>
              ) : user ? (
                <form action={`/api/purchase/${card.id}`} method="POST" className="mb-6">
                  <p className="text-3xl font-bold text-gray-900 mb-4">Free</p>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Get Card (Free)
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Free access for MVP users
                  </p>
                </form>
              ) : (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-900 mb-4">Free</p>
                  <Link
                    href="/login"
                    className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 font-medium"
                  >
                    Sign In to Get Card
                  </Link>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">License</h4>
                <p className="text-sm text-gray-600 mb-4">{card.licenseType.replace(/_/g, " ")}</p>

                <h4 className="font-semibold text-gray-900 mb-3">Trust Indicators</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Verified Seller</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{card._count.certifications} verified certifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Free updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
