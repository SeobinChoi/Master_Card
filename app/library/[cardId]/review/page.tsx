import { redirect, notFound } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ReviewForm } from "@/components/review-form"

export default async function ReviewPage({ params }: { params: Promise<{ cardId: string }> }) {
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
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!purchase) {
      notFound()
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
    })

    if (existingReview) {
      redirect(`/library/${cardId}`)
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href={`/library/${cardId}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              &larr; Back to Card
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h1>
            <p className="text-gray-600 mb-6">For: {purchase.card.title}</p>

            <ReviewForm cardId={cardId} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
