"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CertificationForm({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    problemSolved: "",
    howUsed: "",
    result: "",
    proofLinks: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          problemSolved: formData.problemSolved,
          howUsed: formData.howUsed,
          result: formData.result,
          proofLinks: formData.proofLinks.split("\n").filter((link) => link.trim() !== ""),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit certification")
      }

      router.push(`/library/${cardId}`)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to submit certification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="problemSolved" className="block text-sm font-medium text-gray-700 mb-1">
          What problem did you solve? *
        </label>
        <textarea
          id="problemSolved"
          required
          rows={3}
          value={formData.problemSolved}
          onChange={(e) => setFormData({ ...formData, problemSolved: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the specific problem or challenge you faced"
        />
      </div>

      <div>
        <label htmlFor="howUsed" className="block text-sm font-medium text-gray-700 mb-1">
          How did you use this card? *
        </label>
        <textarea
          id="howUsed"
          required
          rows={4}
          value={formData.howUsed}
          onChange={(e) => setFormData({ ...formData, howUsed: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Explain how you applied the knowledge from this card"
        />
      </div>

      <div>
        <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">
          What was the result? *
        </label>
        <textarea
          id="result"
          required
          rows={4}
          value={formData.result}
          onChange={(e) => setFormData({ ...formData, result: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the outcome and impact of using this card"
        />
      </div>

      <div>
        <label htmlFor="proofLinks" className="block text-sm font-medium text-gray-700 mb-1">
          Proof Links (optional)
        </label>
        <textarea
          id="proofLinks"
          rows={3}
          value={formData.proofLinks}
          onChange={(e) => setFormData({ ...formData, proofLinks: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add links to screenshots, repositories, or other proof (one per line)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Links help verify your certification. Enter one URL per line.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Your certification will be submitted for admin review. Once verified, it will display a verified badge on the card page.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Submitting..." : "Submit Certification"}
        </button>
      </div>
    </form>
  )
}
