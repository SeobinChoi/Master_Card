import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const certificationId = formData.get("certificationId") as string
    const action = formData.get("action") as string

    if (!certificationId || !action) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (action === "verify") {
      await prisma.certification.update({
        where: { id: certificationId },
        data: { verified: true },
      })
    } else if (action === "reject") {
      await prisma.certification.delete({
        where: { id: certificationId },
      })
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      )
    }

    return NextResponse.redirect(new URL("/admin/certifications", request.url))
  } catch (error) {
    console.error("Error managing certification:", error)
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    )
  }
}
