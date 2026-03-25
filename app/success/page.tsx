import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-blue-100/80 text-lg mb-8">
          Welcome to ResumeAI. You now have unlimited access to all three tools.
          Start optimizing your resume right now.
        </p>
        <Link
          href="/app"
          className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold py-4 px-10 rounded-xl text-lg transition"
        >
          Launch ResumeAI →
        </Link>
      </div>
    </main>
  );
}
