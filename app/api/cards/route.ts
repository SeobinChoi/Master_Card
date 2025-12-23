import { NextRequest, NextResponse } from "next/server"
import { requireSeller } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { CardType, LicenseType, CardStatus } from "@prisma/client"
import { validateCardStructure } from "@/lib/card-validation"

export async function POST(request: NextRequest) {
  try {
    const user = await requireSeller()
    const body = await request.json()

    const { title, summary, markdownContent, category, type, licenseType, status } = body

    if (!title || !summary || !markdownContent || !category || !type || !licenseType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

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

    const card = await prisma.card.create({
      data: {
        sellerId: user.id,
        title,
        summary,
        markdownContent,
        category,
        type: type as CardType,
        licenseType: licenseType as LicenseType,
        status: status as CardStatus,
        version: 1,
      },
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create card" },
      { status: 500 }
    )
  }
}
