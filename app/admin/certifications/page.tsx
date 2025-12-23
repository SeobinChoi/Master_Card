import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function CertificationsAdminPage() {
  try {
    await requireAdmin()

    const pendingCertifications = await prisma.certification.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        card: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              &larr; Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Certification Verification</h1>

          {pendingCertifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending certifications</h3>
              <p className="text-gray-600">All certifications have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingCertifications.map((cert) => (
                <div key={cert.id} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cert.card.title}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted by {cert.user.name} ({cert.user.email})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Problem Solved:</h4>
                      <p className="text-gray-700 text-sm">{cert.problemSolved}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">How Used:</h4>
                      <p className="text-gray-700 text-sm">{cert.howUsed}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">Result:</h4>
                      <p className="text-gray-700 text-sm">{cert.result}</p>
                    </div>
                    {cert.proofLinks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">Proof Links:</h4>
                        <ul className="list-disc list-inside text-sm text-blue-600">
                          {cert.proofLinks.map((link, i) => (
                            <li key={i}>
                              <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <form action="/api/admin/certifications" method="POST">
                      <input type="hidden" name="certificationId" value={cert.id} />
                      <input type="hidden" name="action" value="verify" />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                      >
                        Verify
                      </button>
                    </form>
                    <form action="/api/admin/certifications" method="POST">
                      <input type="hidden" name="certificationId" value={cert.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button
                        type="submit"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    redirect("/login")
  }
}
