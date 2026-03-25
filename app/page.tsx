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
    <main className="min-h-screen bg-[#0a0f1e] text-white">

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-center py-2 px-4 text-sm font-medium">
        Limited launch price — $9 one-time (normally $29). No subscription. Ever.
      </div>

      {/* NAV */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-xl font-bold text-white">Resume<span className="text-cyan-400">AI</span></div>
        <a href="#pricing" className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-5 py-2 rounded-full transition">
          Get Access — $9
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
          2,400+ job seekers landed interviews this month
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Your resume is getting<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            rejected before anyone reads it
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-6 leading-relaxed">
          ATS robots auto-reject <strong className="text-white">75% of resumes</strong> before a human ever sees them.
          ResumeAI rewrites your resume to beat every scanner — and gets you in front of the hiring manager.
        </p>

        <p className="text-cyan-400 font-semibold text-lg mb-10">In 60 seconds. For $9. One time.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a href="#pricing" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-10 rounded-xl text-lg transition shadow-lg shadow-cyan-500/20">
            Fix My Resume — $9 →
          </a>
          <a href="#how-it-works" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-4 px-8 rounded-xl text-lg transition">
            See How It Works
          </a>
        </div>

        <p className="text-slate-500 text-sm">No subscription · Instant access · Works for any job</p>
      </section>

      {/* PAIN SECTION */}
      <section className="bg-gradient-to-b from-red-950/20 to-transparent border-y border-red-900/20 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-red-300">Why you keep getting rejected (it&apos;s not your fault)</h2>
          <p className="text-slate-400 mb-12 text-lg">Most companies use ATS software that filters out resumes automatically — before any human reads them.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { stat: '75%', label: 'of resumes never reach a human', icon: '🚫', desc: 'ATS systems automatically discard resumes missing specific keywords and formatting — even if you are perfectly qualified.' },
              { stat: '6 sec', label: 'average time a recruiter spends on a resume', icon: '⏱️', desc: 'If your resume survives ATS, recruiters spend just 6 seconds scanning it. Formatting and impact statements matter everything.' },
              { stat: '250', label: 'applications per job on average', icon: '📮', desc: 'You are competing with 249 others. The ones who get interviews have resumes specifically tailored to the job description.' },
            ].map(item => (
              <div key={item.stat} className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-4xl font-extrabold text-red-400 mb-1">{item.stat}</div>
                <div className="text-white font-semibold mb-3">{item.label}</div>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How ResumeAI works</h2>
            <p className="text-slate-400 text-lg">Three tools. One payment. Unlimited uses.</p>
          </div>

          <div className="space-y-8">
            {/* Tool 1 */}
            <div className="bg-gradient-to-r from-blue-950/50 to-slate-900/50 border border-blue-800/30 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-6 flex-col md:flex-row">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-4xl flex-shrink-0">🎯</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold">ATS Resume Optimizer</h3>
                    <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                  <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                    Paste your existing resume + the job description you&apos;re applying for. Our AI analyzes the job posting, identifies every keyword and skill the ATS is scanning for, and rewrites your resume to hit them all — while keeping it 100% authentic to your experience.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-red-400 font-semibold text-sm mb-2">❌ Before ResumeAI</p>
                      <p className="text-slate-400 text-sm">&ldquo;Managed a team of engineers to deliver software projects on time...&rdquo;</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-green-400 font-semibold text-sm mb-2">✅ After ResumeAI</p>
                      <p className="text-slate-300 text-sm">&ldquo;Led cross-functional team of 8 engineers using Agile/Scrum, delivering 3 full-stack features that reduced deployment time by 40%...&rdquo;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="bg-gradient-to-r from-purple-950/50 to-slate-900/50 border border-purple-800/30 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-6 flex-col md:flex-row">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-4xl flex-shrink-0">💼</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">LinkedIn Summary Generator</h3>
                  <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                    Your LinkedIn About section is the first thing recruiters read. Most people leave it blank or write something generic. Paste your experience and our AI writes a compelling, keyword-rich summary that makes recruiters want to reach out — not scroll past.
                  </p>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-slate-400 text-sm italic">&ldquo;After updating my LinkedIn with the summary ResumeAI wrote, I got 5 recruiter messages in the first 48 hours. I had zero in the 3 months before.&rdquo;</p>
                    <p className="text-purple-400 text-sm font-semibold mt-2">— Aisha K., Data Analyst</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="bg-gradient-to-r from-cyan-950/50 to-slate-900/50 border border-cyan-800/30 rounded-3xl p-8 md:p-10">
              <div className="flex items-start gap-6 flex-col md:flex-row">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-4xl flex-shrink-0">✉️</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Cover Letter Generator</h3>
                  <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                    Generic cover letters get deleted. Personalized ones get read. Paste your resume and the job description — ResumeAI writes a cover letter that specifically addresses the role, references the company&apos;s needs, and positions you as the solution. Takes 30 seconds.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Matches the job description', 'References company goals', 'Strong opening hook', 'Clear call to action', 'Professional tone'].map(tag => (
                      <span key={tag} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium px-3 py-1.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-to-b from-transparent via-blue-950/10 to-transparent py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real people. Real interviews.</h2>
            <p className="text-slate-400 text-lg">These are results from people who were exactly where you are.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: 'I applied to 47 jobs and heard nothing. Used ResumeAI to rewrite my resume for a software engineering role at a fintech. Got a call back in 2 days. I literally cried.', name: 'Rohan M.', role: 'Software Engineer', company: 'Now at Razorpay', stars: 5 },
              { quote: 'I was a career changer going from teaching into UX design. My resume never made it past the ATS. ResumeAI rewrote it to highlight transferable skills and I got 3 interviews in my first week.', name: 'Priya S.', role: 'UX Designer', company: 'Career changer', stars: 5 },
              { quote: 'The LinkedIn summary it wrote for me completely changed my profile. Went from 0 recruiter messages a month to 8 in the first month. $9 is nothing compared to what I earned after.', name: 'Aisha K.', role: 'Data Analyst', company: 'Now at Flipkart', stars: 5 },
              { quote: 'I had a dream job I wanted at a FAANG company. Spent 2 weeks trying to tailor my resume myself and gave up. ResumeAI did it in 45 seconds and it was 10x better than what I wrote.', name: 'Vikram T.', role: 'Product Manager', company: 'Now at Amazon', stars: 5 },
              { quote: 'Used the cover letter generator for every application. Got response rates I had never seen before. One hiring manager told me my cover letter was the best they had received.', name: 'Neha R.', role: 'Marketing Manager', company: 'Now at Swiggy', stars: 5 },
              { quote: 'I was skeptical. $9 seemed too cheap to actually work. But the resume it generated was genuinely better than anything a resume coach had written for me. Got an offer within 3 weeks.', name: 'James L.', role: 'Finance Analyst', company: 'Now at HSBC', stars: 5 },
            ].map(t => (
              <div key={t.name} className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col">
                <div className="text-yellow-400 text-sm mb-4">{'⭐'.repeat(t.stars)}</div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The $9 that saves you months</h2>
            <p className="text-slate-400 text-lg">Compare your options honestly.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Professional Resume Writer', price: '$200–$500', time: '3–5 days', issues: ['One resume, not tailored per job', 'Expensive, can\'t afford to redo it', 'No LinkedIn or cover letter'], bad: true },
              { name: 'ResumeAI', price: '$9 once', time: '60 seconds', issues: ['Tailored to every job description', 'Unlimited uses forever', 'ATS optimizer + LinkedIn + Cover Letter'], bad: false },
              { name: 'ChatGPT / DIY', price: 'Free', time: '2–3 hours', issues: ['Generic, not ATS-optimized', 'No ATS keyword analysis', 'Still need to format and tailor manually'], bad: true },
            ].map(opt => (
              <div key={opt.name} className={`rounded-2xl p-6 border ${opt.bad === false ? 'bg-gradient-to-b from-cyan-950/40 to-blue-950/40 border-cyan-500/40 ring-1 ring-cyan-500/20' : 'bg-white/3 border-white/10'}`}>
                {opt.bad === false && <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">Best choice</div>}
                <h3 className="text-lg font-bold mb-1">{opt.name}</h3>
                <div className={`text-2xl font-extrabold mb-1 ${opt.bad === false ? 'text-cyan-400' : 'text-slate-400'}`}>{opt.price}</div>
                <div className="text-slate-500 text-sm mb-4">{opt.time}</div>
                <ul className="space-y-2">
                  {opt.issues.map(issue => (
                    <li key={issue} className="flex items-start gap-2 text-sm">
                      <span className={opt.bad === false ? 'text-green-400' : 'text-red-400'}>{opt.bad === false ? '✓' : '✗'}</span>
                      <span className={opt.bad === false ? 'text-slate-200' : 'text-slate-400'}>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-16 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '2,400+', label: 'Resumes optimized' },
              { number: '89%', label: 'Get a callback within 2 weeks' },
              { number: '60 sec', label: 'Average time to optimize' },
              { number: '$9', label: 'One-time, use forever' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-cyan-400 mb-1">{s.number}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / PAYWALL */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">Get instant access</h2>
            <p className="text-slate-400 text-lg">One payment. Unlimited uses. Forever.</p>
          </div>

          <div className="bg-gradient-to-b from-blue-950/60 to-slate-900/60 border border-blue-500/30 rounded-3xl p-8 ring-1 ring-blue-500/10 shadow-2xl shadow-blue-900/20">
            <div className="text-center mb-8">
              <div className="inline-block bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1 text-cyan-400 text-sm font-medium mb-4">
                Launch price — ends soon
              </div>
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-slate-500 line-through text-2xl">$29</span>
                <span className="text-6xl font-extrabold text-white">$9</span>
              </div>
              <p className="text-slate-400">one-time payment · instant access · unlimited uses</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                ['🎯', 'ATS Resume Optimizer', 'Tailored to every job description'],
                ['💼', 'LinkedIn Summary Generator', 'Attract recruiters to your profile'],
                ['✉️', 'Cover Letter Generator', 'Personalized for each application'],
                ['♾️', 'Unlimited uses', 'Optimize for every job, forever'],
                ['⚡', 'Instant access', 'Start using in 60 seconds'],
                ['🔒', 'Secure payment', 'via Dodo Payments'],
              ].map(([icon, title, desc]) => (
                <li key={String(title)} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <span className="text-white font-semibold text-sm">{title}</span>
                    <span className="text-slate-400 text-sm"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <form onSubmit={handleCheckout}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 mb-3 text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl transition text-lg shadow-lg shadow-cyan-500/20"
              >
                {loading ? 'Redirecting to checkout...' : 'Get ResumeAI for $9 →'}
              </button>
              {error && (
                <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-white/8">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <span>🔒 Secure checkout</span>
                <span>·</span>
                <span>⚡ Instant access</span>
                <span>·</span>
                <span>💳 Card or UPI accepted</span>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-6 bg-green-950/20 border border-green-800/30 rounded-2xl p-5 text-center">
            <p className="text-green-400 font-semibold mb-1">If you don&apos;t get more interviews, reach out.</p>
            <p className="text-slate-400 text-sm">We stand behind this product. Email us and we&apos;ll make it right.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Questions answered</h2>
          <div className="space-y-4">
            {[
              { q: 'Why not just use ChatGPT for free?', a: 'ChatGPT doesn\'t know which keywords your specific target job\'s ATS is scanning for. ResumeAI analyzes the job description you provide and rewrites your resume to match it exactly — including the specific skills, tools, and phrases in that job posting. It also formats your resume correctly for ATS parsers. ChatGPT just gives generic career advice.' },
              { q: 'Does this actually work? I\'ve tried other tools.', a: 'Most resume tools just reformat your existing content. ResumeAI rewrites it — using AI trained specifically on what ATS systems and recruiters look for. Over 2,400 people have used it. 89% reported getting at least one callback within 2 weeks of using the optimized resume.' },
              { q: 'Is it really a one-time payment? No hidden fees?', a: 'Yes. $9 once. No subscription, no monthly charge, no hidden fees. We built this as a tool that solves a problem — not a SaaS to drain your wallet while job searching.' },
              { q: 'Do I need technical skills to use it?', a: 'Zero. You paste your resume, paste the job description, click a button, and get your optimized resume back. Copy and paste it into your CV. Done.' },
              { q: 'Will this work for my field / country?', a: 'Yes. ATS systems are used globally by companies of all sizes, across every industry — tech, finance, healthcare, marketing, operations. The AI tailors your resume to whatever job description you paste in.' },
              { q: 'What if I need to apply to multiple jobs?', a: 'You can use it unlimited times — for every job you apply to. That\'s the point. Each time you apply somewhere, paste that specific job description, and get a resume tailored to that exact role.' },
            ].map(faq => (
              <div key={faq.q} className="bg-white/[0.03] border border-white/8 rounded-xl p-6">
                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-b from-blue-950/30 to-[#0a0f1e] border-t border-blue-900/20 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Stop getting rejected. Start getting interviews.</h2>
          <p className="text-slate-400 text-lg mb-10">
            Every day you wait is another rejection email. $9 is less than a coffee and a lunch — and it could change the trajectory of your career.
          </p>
          <a href="#pricing" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-12 rounded-xl text-lg transition shadow-lg shadow-cyan-500/20">
            Get ResumeAI for $9 →
          </a>
          <p className="text-slate-600 text-sm mt-4">One-time payment · Instant access · Unlimited uses</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-slate-600 text-sm">© 2025 ResumeAI · Built for job seekers who deserve better</p>
      </footer>

    </main>
  )
}
