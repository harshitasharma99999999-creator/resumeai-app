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
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-blue-300 text-sm font-medium mb-6">
            Used by 2,000+ job seekers this month
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get more interviews<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">in 60 seconds</span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto mb-4">
            75% of resumes are rejected by ATS before a human sees them. ResumeAI rewrites your resume to pass every scanner and land on a hiring manager&apos;s desk.
          </p>
          <p className="text-blue-300 text-lg font-semibold">One-time $9 payment. No subscription. Ever.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🎯', title: 'ATS Resume Optimizer', desc: 'Paste your resume + job description. Get an ATS-optimized version that passes scanners and gets you noticed.' },
            { icon: '💼', title: 'LinkedIn Summary Generator', desc: 'Turn your experience into a compelling LinkedIn About section that attracts recruiters and hiring managers.' },
            { icon: '✉️', title: 'Cover Letter Generator', desc: 'Generate a personalized, interview-winning cover letter for each application in 30 seconds.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-blue-100/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            { quote: 'Got 3 interviews in my first week after using ResumeAI. The ATS optimizer is a game changer.', name: 'Priya S., Software Engineer' },
            { quote: 'Finally passed the ATS screening after 47 rejections. Landed at a Fortune 500 company.', name: 'Marcus T., Product Manager' },
            { quote: 'The LinkedIn summary it wrote got me 5 recruiter messages in 48 hours. Worth every penny.', name: 'Aisha K., Data Analyst' },
          ].map((t) => (
            <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-yellow-400 text-sm mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-blue-100/80 text-sm italic mb-3">&ldquo;{t.quote}&rdquo;</p>
              <p className="text-blue-300 text-xs font-medium">{t.name}</p>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white/5 border border-white/20 rounded-3xl p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="text-blue-300 text-sm font-medium mb-1">Limited time</div>
              <div className="text-6xl font-bold mb-1">$9</div>
              <div className="text-blue-300">one-time · unlimited uses forever</div>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {[
                'ATS Resume Optimizer',
                'LinkedIn Summary Generator',
                'Cover Letter Generator',
                'Copy to clipboard',
                'Unlimited uses forever',
                'No subscription ever',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-green-300 font-medium">
                  <span>✓</span> {item}
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
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition text-lg shadow-lg shadow-blue-500/25"
              >
                {loading ? 'Processing...' : 'Get ResumeAI for $9'}
              </button>
              {error && (
                <div className="mt-3 bg-red-500/10 border border-red-400/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </form>

            <p className="text-center text-xs text-blue-100/40 mt-4">
              Secure payment via Dodo Payments · Instant access after purchase
            </p>
          </div>

          <div className="text-center mt-6 text-blue-300/60 text-sm">
            Join 2,000+ job seekers who stopped getting rejected
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How is this different from ChatGPT?', a: 'ResumeAI is specifically built for ATS optimization. It knows exactly what keywords, formatting, and structure hiring systems look for. ChatGPT gives generic advice — we give you a job-winning resume.' },
              { q: 'Is this really a one-time payment?', a: 'Yes. Pay $9 once, use it forever. No monthly fees, no hidden charges.' },
              { q: 'Will this work for my industry?', a: 'Yes. Our AI analyzes the specific job description you provide and tailors your resume to match — works for tech, finance, healthcare, marketing, and more.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-2 text-blue-100">{faq.q}</h3>
                <p className="text-blue-100/60 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
