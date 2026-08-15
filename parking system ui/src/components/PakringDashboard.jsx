import React from "react";
import Slot from "./Slot";
import Parking from "./Parking";

export default function PakringDashboard() {
  return (
    <div className="min-h-screen bg-base">
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