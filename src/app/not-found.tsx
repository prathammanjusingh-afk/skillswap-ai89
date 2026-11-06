import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-100 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="text-center relative z-10 max-w-md mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-600/10 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Lost in Orbit</span>
        </div>

        <h1
          className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r tracking-tight"
          style={{
            backgroundImage:
              "linear-gradient(179.1deg, #FFFFFF 0.77%, rgba(255, 255, 255, 0.4) 182.09%)",
          }}
        >
          404
        </h1>

        <p className="text-gray-400 text-sm leading-relaxed">
          The page or skill exchange resource you are looking for has been relocated or doesn&apos;t exist.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
