'use client';

import { useState } from 'react';

type Tab = 'ats' | 'linkedin' | 'cover_letter';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ats');
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [experience, setExperience] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const payload: Record<string, string> = { type: activeTab };
      if (activeTab === 'ats' || activeTab === 'cover_letter') {
        payload.resume = resume;
        payload.jobDescription = jobDescription;
      } else {
        payload.experience = experience;
      }

      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'ats' as Tab, label: 'ATS Resume', icon: '🎯' },
    { id: 'linkedin' as Tab, label: 'LinkedIn Summary', icon: '💼' },
    { id: 'cover_letter' as Tab, label: 'Cover Letter', icon: '✉️' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ResumeAI Dashboard</h1>
          <p className="text-blue-300/70">Choose a tool and start generating</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/5 rounded-2xl p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-300/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            {(activeTab === 'ats' || activeTab === 'cover_letter') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Your Resume
                  </label>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your full resume here..."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none text-sm"
                  />
                </div>
              </>
            )}

            {activeTab === 'linkedin' && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Your Role & Experience
                </label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your current role, key achievements, skills, and what you're looking for next..."
                  rows={14}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none text-sm"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition text-lg"
            >
              {loading ? 'Generating...' : `Generate ${tabs.find(t => t.id === activeTab)?.label}`}
            </button>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-blue-200">Output</label>
              {result && (
                <button
                  onClick={handleCopy}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition"
                >
                  {copied ? '✓ Copied!' : 'Copy to clipboard'}
                </button>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[400px] text-sm text-blue-100/90 whitespace-pre-wrap font-mono">
              {loading && (
                <div className="flex items-center gap-2 text-blue-300/60">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Generating with AI...
                </div>
              )}
              {!loading && !result && (
                <span className="text-white/20">Your generated content will appear here...</span>
              )}
              {result}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
