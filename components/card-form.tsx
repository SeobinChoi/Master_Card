"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardType, LicenseType, CardStatus } from "@prisma/client"
import { validateCardStructure, MANDATORY_SECTIONS } from "@/lib/card-validation"

interface CardFormProps {
  initialData?: {
    id?: string
    title: string
    summary: string
    markdownContent: string
    category: string
    type: CardType
    licenseType: LicenseType
    status: CardStatus
  }
  isEdit?: boolean
}

export function CardForm({ initialData, isEdit = false }: CardFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    summary: initialData?.summary || "",
    markdownContent: initialData?.markdownContent || "",
    category: initialData?.category || "",
    type: initialData?.type || CardType.GUIDE,
    licenseType: initialData?.licenseType || LicenseType.PERSONAL,
    status: initialData?.status || CardStatus.DRAFT,
  })

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setValidationErrors([])

    const validation = validateCardStructure(formData.markdownContent)

    if (publish && !validation.valid) {
      setValidationErrors([
        "Cannot publish: Missing required sections:",
        ...validation.missingSections,
      ])
      return
    }

    setIsLoading(true)

    try {
      const url = isEdit ? `/api/cards/${initialData?.id}` : "/api/cards"
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: publish ? CardStatus.PUBLISHED : CardStatus.DRAFT,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to save card")
      }

      const card = await response.json()
      router.push(`/seller/dashboard`)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save card")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-medium mb-2">{validationErrors[0]}</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {validationErrors.slice(1).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Give your card a clear, descriptive title"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
          Summary *
        </label>
        <textarea
          id="summary"
          required
          rows={3}
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brief description of what this card offers"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Card Type *
          </label>
          <select
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CardType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(CardType).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Web Development, Design"
          />
        </div>
      </div>

      <div>
        <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">
          License Type *
        </label>
        <select
          id="licenseType"
          required
          value={formData.licenseType}
          onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as LicenseType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.values(LicenseType).map((license) => (
            <option key={license} value={license}>
              {license.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="markdownContent" className="block text-sm font-medium text-gray-700 mb-1">
          Markdown Content *
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Must include these sections: {MANDATORY_SECTIONS.join(", ")}
        </p>
        <textarea
          id="markdownContent"
          required
          rows={20}
          value={formData.markdownContent}
          onChange={(e) => setFormData({ ...formData, markdownContent: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="# Problem Definition&#10;&#10;# Target Audience&#10;&#10;# Solution Overview&#10;&#10;# Contents&#10;&#10;# Usage Notes & Limitations"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Publishing..." : isEdit ? "Update & Publish" : "Publish Card"}
        </button>
      </div>
    </form>
  )
}
