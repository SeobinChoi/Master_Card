import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { cardId, rating, title, content } = body

    if (!cardId || !rating || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { message: "You must purchase this card before reviewing it" },
        { status: 403 }
      )
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
      return NextResponse.json(
        { message: "You have already reviewed this card" },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        cardId,
        rating,
        title: title || null,
        content,
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create review" },
      { status: 500 }
    )
  }
}
