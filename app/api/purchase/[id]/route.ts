import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: cardId } = await params

    const card = await prisma.card.findUnique({
      where: { id: cardId },
    })

    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 })
    }

    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_cardId: {
          userId: user.id,
          cardId,
        },
      },
    })

    if (existingPurchase) {
      return NextResponse.redirect(new URL(`/library/${cardId}`, request.url))
    }

    await prisma.purchase.create({
      data: {
        userId: user.id,
        cardId,
        price: 0,
      },
    })

    return NextResponse.redirect(new URL(`/library/${cardId}`, request.url))
  } catch (error) {
    console.error("Error processing purchase:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.json(
      { message: "Failed to process purchase" },
      { status: 500 }
    )
  }
}
