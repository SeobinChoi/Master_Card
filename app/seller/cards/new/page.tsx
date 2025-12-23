import { redirect } from "next/navigation"
import { requireSeller } from "@/lib/session"
import { CardForm } from "@/components/card-form"
import Link from "next/link"

export default async function NewCardPage() {
  try {
    await requireSeller()

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/seller/dashboard"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Card</h1>
            <CardForm />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
