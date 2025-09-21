'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                严重错误
              </h2>
              <p className="text-gray-600 mb-6">
                应用程序遇到了一个严重错误。请刷新页面或联系技术支持。
              </p>
              <button
                onClick={reset}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
