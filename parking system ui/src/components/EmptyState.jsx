import React from "react";

export default function EmptyState({ label, hint }) {
  return (
    <div className="text-center py-20 bg-light rounded-2xl border border-dashed border-slate/20">
      <p className="font-display font-semibold text-dark">{label}</p>
      {hint && <p className="text-sm text-slate mt-1">{hint}</p>}
    </div>
  );
}
