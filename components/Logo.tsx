export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-green-400 font-black text-black shadow-[0_0_24px_rgba(34,211,238,0.45)]">
        LF
      </div>

      <div className="text-left leading-none">
        <p className="text-lg font-black tracking-tight text-white">
          LeadFlow
          <span className="text-cyan-400">AI</span>
        </p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Property Intel
        </p>
      </div>
    </div>
  );
}