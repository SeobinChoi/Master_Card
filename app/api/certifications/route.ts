import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { cardId, problemSolved, howUsed, result, proofLinks } = body

    if (!cardId || !problemSolved || !howUsed || !result) {
      return NextResponse.json(
        { message: "Missing required fields" },
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
        { message: "You must purchase this card before certifying it" },
        { status: 403 }
      )
    }

    const existingCertification = await prisma.certification.findFirst({
      where: {
        userId: user.id,
        cardId,
      },
    })

    if (existingCertification) {
      return NextResponse.json(
        { message: "You have already submitted a certification for this card" },
        { status: 409 }
      )
    }

    const certification = await prisma.certification.create({
      data: {
        userId: user.id,
        cardId,
        problemSolved,
        howUsed,
        result,
        proofLinks: proofLinks || [],
        proofImages: [],
        verified: false,
      },
    })

    return NextResponse.json(certification)
  } catch (error) {
    console.error("Error creating certification:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create certification" },
      { status: 500 }
    )
  }
}
