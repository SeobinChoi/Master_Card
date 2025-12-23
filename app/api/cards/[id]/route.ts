import { NextRequest, NextResponse } from "next/server"
import { requireSeller } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { CardType, LicenseType, CardStatus } from "@prisma/client"
import { validateCardStructure } from "@/lib/card-validation"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSeller()
    const { id } = await params
    const body = await request.json()

    const existingCard = await prisma.card.findUnique({
      where: { id },
    })

    if (!existingCard || existingCard.sellerId !== user.id) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 })
    }

    const { title, summary, markdownContent, category, type, licenseType, status } = body

    if (status === CardStatus.PUBLISHED) {
      const validation = validateCardStructure(markdownContent)
      if (!validation.valid) {
        return NextResponse.json(
          {
            message: "Cannot publish: Card is missing required sections",
            missingSections: validation.missingSections,
          },
          { status: 400 }
        )
      }
    }

    const contentChanged = existingCard.markdownContent !== markdownContent
    const shouldIncrementVersion = contentChanged && status === CardStatus.PUBLISHED

    const card = await prisma.card.update({
      where: { id },
      data: {
        title,
        summary,
        markdownContent,
        category,
        type: type as CardType,
        licenseType: licenseType as LicenseType,
        status: status as CardStatus,
        version: shouldIncrementVersion ? { increment: 1 } : undefined,
      },
    })

    if (shouldIncrementVersion) {
      await prisma.cardUpdate.create({
        data: {
          cardId: id,
          version: card.version,
          title: `Version ${card.version} Update`,
          content: "Card content has been updated",
        },
      })
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update card" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSeller()
    const { id } = await params

    const existingCard = await prisma.card.findUnique({
      where: { id },
    })

    if (!existingCard || existingCard.sellerId !== user.id) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 })
    }

    await prisma.card.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Card deleted successfully" })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete card" },
      { status: 500 }
    )
  }
}
