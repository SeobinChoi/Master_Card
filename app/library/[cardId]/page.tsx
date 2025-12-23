import { redirect, notFound } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"

export default async function CardViewerPage({ params }: { params: Promise<{ cardId: string }> }) {
  try {
    const user = await requireAuth()
    const { cardId } = await params

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
      include: {
        card: {
          include: {
            seller: {
              select: {
                name: true,
              },
            },
            attachments: true,
          },
        },
      },
    })

    if (!purchase) {
      notFound()
    }

    const { card } = purchase
    const hasReview = await prisma.review.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
    })

    const hasCertification = await prisma.certification.findFirst({
      where: {
        userId: user.id,
        cardId,
      },
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/library" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                &larr; Back to Library
              </Link>
              <div className="flex gap-3">
                {!hasReview && (
                  <Link
                    href={`/library/${cardId}/review`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Write Review
                  </Link>
                )}
                {!hasCertification && (
                  <Link
                    href={`/library/${cardId}/certify`}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Submit Certification
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {card.type.replace(/_/g, " ")}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                {card.category}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
                v{card.version}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">{card.title}</h1>
            <p className="text-gray-600 mb-6">by {card.seller.name}</p>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {card.markdownContent}
              </ReactMarkdown>
            </div>
          </div>

          {card.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Attachments</h2>
              <div className="space-y-3">
                {card.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{attachment.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {attachment.fileType} • {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Share Your Experience</h3>
            <p className="text-blue-800 text-sm mb-4">
              Help others by sharing how this card helped you solve a problem
            </p>
            <div className="flex gap-3">
              {!hasReview && (
                <Link
                  href={`/library/${cardId}/review`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Write Review
                </Link>
              )}
              {!hasCertification && (
                <Link
                  href={`/library/${cardId}/certify`}
                  className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 text-sm font-medium"
                >
                  Submit Certification
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
