'use client'

import { useState } from 'react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-blue-300 text-sm font-medium mb-6">
            AI-Powered Resume Optimizer
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get more interviews<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">in 60 seconds</span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto mb-4">
            75% of resumes are rejected by ATS before a human sees them. ResumeAI rewrites your resume to pass every scanner and land on a hiring manager&apos;s desk.
          </p>
          <p className="text-blue-300 text-lg">One-time payment. No subscription. Ever.</p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🎯', title: 'ATS Resume Optimizer', desc: 'Paste your resume + job description. Get an ATS-optimized version that passes scanners.' },
            { icon: '💼', title: 'LinkedIn Summary Generator', desc: 'Turn your experience into a compelling LinkedIn About section that attracts recruiters.' },
            { icon: '✉️', title: 'Cover Letter Generator', desc: 'Generate a personalized cover letter for each application in seconds.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-blue-100/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Paywall */}
        <div className="max-w-md mx-auto bg-white/5 border border-white/20 rounded-3xl p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-1">$9</div>
            <div className="text-blue-300">one-time · unlimited uses</div>
          </div>

          <ul className="space-y-3 mb-8 text-sm text-blue-100/80">
            {[
              'ATS Resume Optimizer',
              'LinkedIn Summary Generator',
              'Cover Letter Generator',
              'Copy to clipboard',
              'Unlimited uses forever',
              'No subscription',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {item}
              </li>
            ))}
          </ul>

          <form onSubmit={handleCheckout}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 mb-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition text-lg"
            >
              {loading ? 'Redirecting...' : 'Get ResumeAI for $9'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </form>

          <p className="text-center text-xs text-blue-100/40 mt-4">
            Secure payment via Dodo Payments. Instant access after purchase.
          </p>
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <p className="text-blue-300/60 text-sm mb-6">Trusted by job seekers worldwide</p>
          <div className="flex flex-wrap justify-center gap-6 text-blue-100/40 text-xs">
            <span>⭐⭐⭐⭐⭐ &quot;Got 3 interviews in a week&quot;</span>
            <span>⭐⭐⭐⭐⭐ &quot;Finally passed the ATS screening&quot;</span>
            <span>⭐⭐⭐⭐⭐ &quot;Worth every penny&quot;</span>
          </div>
        </div>
      </div>
    </main>
  )
}
