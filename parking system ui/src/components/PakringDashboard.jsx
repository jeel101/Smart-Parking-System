import React from "react";
import Slot from "./Slot";
import Parking from "./Parking";

export default function ParkingDashboard() {
  return (
    <div className="min-h-screen bg-base">
      {/* Top brand bar */}
      <div className="bg-ink border-b border-black/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulseDot" />
            <h1 className="font-display text-lg font-bold text-white tracking-wide">
              ParkWise <span className="text-sand">/ Lot 1</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
            Real-time availability
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT / MAJOR — visual slot map */}
          <div className="lg:col-span-8">
            <Slot />
          </div>

          {/* RIGHT — manual booking desk */}
          <div className="lg:col-span-4">
            <Parking />
          </div>
        </div>
      </div>
    </div>
  );
}