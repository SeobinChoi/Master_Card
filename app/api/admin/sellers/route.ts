import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const userId = formData.get("userId") as string
    const action = formData.get("action") as string

    if (!userId || !action) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          sellerApproved: true,
          role: UserRole.SELLER,
        },
      })
    } else if (action === "reject") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: UserRole.BUYER,
          sellerApproved: false,
        },
      })
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      )
    }

    return NextResponse.redirect(new URL("/admin/sellers", request.url))
  } catch (error) {
    console.error("Error managing seller:", error)
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    )
  }
}
