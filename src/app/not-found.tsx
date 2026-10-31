export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <p className="text-slate-400 text-lg mb-6">Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-400 transition-colors"
        >
          Back to SkillSwap AI
        </a>
      </div>
    </div>
  );
}
