'use client'

export default function PayloadError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('[PAYLOAD ADMIN] Error boundary caught:', error)
  console.error('[PAYLOAD ADMIN] Error stack:', error.stack)
  console.error('[PAYLOAD ADMIN] Error digest:', error.digest)

  return (
    <html>
      <body style={{ margin: 0, padding: '2rem', fontFamily: 'system-ui', background: '#1a1a2e' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <h1 style={{ color: '#f87171', marginTop: 0 }}>
              Payload Admin Panel Error
            </h1>

            <div style={{ color: '#fff', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Error Details:</h2>
              <pre style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>
                <code>{error.message}</code>
              </pre>
            </div>

            {error.stack && (
              <div style={{ color: '#fff', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Stack Trace:</h2>
                <pre style={{
                  background: 'rgba(0,0,0,0.5)',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '0.75rem'
                }}>
                  <code>{error.stack}</code>
                </pre>
              </div>
            )}

            <div style={{ color: '#fff', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Environment Check:</h2>
              <pre style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.9rem'
              }}>
                <code>{JSON.stringify({
                  timestamp: new Date().toISOString(),
                  errorName: error.name,
                  errorDigest: error.digest || 'none',
                }, null, 2)}</code>
              </pre>
            </div>

            <button
              onClick={reset}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Try Again
            </button>

            <p style={{ color: '#9ca3af', marginTop: '2rem', fontSize: '0.9rem' }}>
              Check AWS Amplify → Monitoring → CloudWatch logs for server-side details.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
