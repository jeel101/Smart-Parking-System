import React from "react";
import Slot from "./Slot";
import Parking from "./Parking";

export default function PakringDashboard() {
  return (
    <div className="min-h-screen bg-base p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE - ONLY SLOTS COMPONENT */}
        <div className="lg:col-span-2">
          <Slot />
        </div>

        {/* RIGHT SIDE - ONLY PARK / UNPARK COMPONENT */}
        <div>
          <Parking />
        </div>
      </div>
    </div>
  );
}
