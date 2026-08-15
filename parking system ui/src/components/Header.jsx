import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ADMIN_LINKS = [{ to: "/admin", label: "Manage Slots" }];

const USER_LINKS = [
  { to: "/parking-dashboard", label: "Book a Slot" },
  { to: "/ticket-dashboard", label: "My Tickets" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("parkwise_role"); // "admin" | "user" | null

  const links = role === "admin" ? ADMIN_LINKS : role === "user" ? USER_LINKS : [];

  const handleSwitchRole = () => {
    localStorage.removeItem("parkwise_role");
    navigate("/login");
  };

  return (
    <header className="bg-ink border-b border-black/10 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        <Link to={role ? (role === "admin" ? "/admin" : "/parking-dashboard") : "/login"} className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulseDot" />
          <span className="font-display text-lg font-bold text-white tracking-wide">
            ParkWise
          </span>
        </Link>

        {links.length > 0 && (
          <nav className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-1.5 rounded-md text-sm font-display font-semibold transition
                    ${active ? "bg-clay text-white" : "text-white/70 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {role && (
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-sand/70 border border-sand/30 rounded-full px-2.5 py-1">
              {role}
            </span>
          )}
          {role ? (
            <button
              onClick={handleSwitchRole}
              className="text-sm font-display font-semibold text-white/70 hover:text-white transition"
            >
              Switch role
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-display font-semibold bg-clay text-white px-4 py-2 rounded-lg hover:bg-sand hover:text-ink transition"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}