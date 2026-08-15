import React from "react";

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-black/10 px-6 py-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-available" />
          <span className="font-display text-sm font-bold text-white tracking-wide">
            ParkWise
          </span>
        </div>
        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} ParkWise — Smart Parking
        </p>
      </div>
    </footer>
  );
}
