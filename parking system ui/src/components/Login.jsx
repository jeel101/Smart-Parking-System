import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaCar } from "react-icons/fa";

// No real authentication yet — this just records which role you're
// using the app as, so Header/routes know what to show. Swap the
// button handlers for a real login call once you have one.

export default function Login() {
  const navigate = useNavigate();

  const chooseRole = (role) => {
    localStorage.setItem("parkwise_role", role);
    navigate(role === "admin" ? "/admin" : "/parking-dashboard");
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulseDot" />
            <span className="font-display text-2xl font-bold text-dark tracking-wide">
              ParkWise
            </span>
          </div>
          <p className="text-slate">Choose how you'd like to continue</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={() => chooseRole("admin")}
            className="group bg-light rounded-2xl p-8 shadow-card border border-slate/10 hover:border-clay text-left transition"
          >
            <div className="w-12 h-12 rounded-xl bg-ink text-sand flex items-center justify-center text-xl mb-4 group-hover:bg-clay group-hover:text-white transition">
              <FaUserShield />
            </div>
            <h3 className="font-display text-lg font-bold text-dark mb-1">
              Continue as Admin
            </h3>
            <p className="text-sm text-slate">
              Manage floors, create slots, and oversee the lot.
            </p>
          </button>

          <button
            onClick={() => chooseRole("user")}
            className="group bg-light rounded-2xl p-8 shadow-card border border-slate/10 hover:border-clay text-left transition"
          >
            <div className="w-12 h-12 rounded-xl bg-ink text-sand flex items-center justify-center text-xl mb-4 group-hover:bg-clay group-hover:text-white transition">
              <FaCar />
            </div>
            <h3 className="font-display text-lg font-bold text-dark mb-1">
              Continue as User
            </h3>
            <p className="text-sm text-slate">
              Book a slot and track your parking tickets.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
