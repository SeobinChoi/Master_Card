export const MANDATORY_SECTIONS = [
  "Problem Definition",
  "Target Audience",
  "Solution Overview",
  "Contents",
  "Usage Notes & Limitations",
]

export function validateCardStructure(markdownContent: string): {
  valid: boolean
  missingSections: string[]
} {
  const missingSections: string[] = []

  for (const section of MANDATORY_SECTIONS) {
    const regex = new RegExp(`^#+\\s*${section}`, "mi")
    if (!regex.test(markdownContent)) {
      missingSections.push(section)
    }
  }

  return {
    valid: missingSections.length === 0,
    missingSections,
  }
}

export function extractTableOfContents(markdownContent: string): string[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const toc: string[] = []
  let match

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    toc.push(match[2].trim())
  }

  return toc
}
