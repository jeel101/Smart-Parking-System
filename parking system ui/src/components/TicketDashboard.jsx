import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import OpenTickets from "./OpenTickets";
import ExpiredTickets from "./ExpiredTickets";
import ClosedTickets from "./ClosedTickets";

const TABS = [
  { key: "OPEN", label: "Open" },
  { key: "EXPIRED", label: "Expired" },
  { key: "CLOSED", label: "Closed" },
];

export default function TicketDashboard() {
  const [activeTab, setActiveTab] = useState("OPEN");
  const [openTickets, setOpenTickets] = useState([]);
  const [expiredTickets, setExpiredTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const [openRes, expiredRes, closedRes] = await Promise.all([
        apiClient.get("/ticket/get-ticket/OPEN"),
        apiClient.get("/ticket/get-ticket/EXPIRED"),
        apiClient.get("/ticket/get-ticket/CLOSED"),
      ]);

      setOpenTickets(openRes.data);
      setExpiredTickets(expiredRes.data);
      setClosedTickets(closedRes.data);
    } catch (error) {
      toast.error("Failed to fetch tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const counts = {
    OPEN: openTickets.length,
    EXPIRED: expiredTickets.length,
    CLOSED: closedTickets.length,
  };

  return (
    <div className="min-h-screen bg-base">
      {/* Brand bar — matches ParkingDashboard */}
      <div className="bg-ink border-b border-black/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulseDot" />
            <h1 className="font-display text-lg font-bold text-white tracking-wide">
              ParkWise <span className="text-sand">/ Tickets</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
            Auto-refreshes every 30s
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Segmented tabs — same pattern as the reservation-type control on the slot map */}
        <div className="inline-flex rounded-lg border border-slate/15 bg-light p-1 mb-8 shadow-card">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm font-display font-semibold rounded-md transition
                ${
                  activeTab === tab.key
                    ? "bg-ink text-white shadow-sm"
                    : "text-dark/60 hover:text-dark"
                }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-white/15" : "bg-slate/10"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "OPEN" && (
          <OpenTickets tickets={openTickets} refreshTickets={fetchTickets} />
        )}
        {activeTab === "EXPIRED" && <ExpiredTickets tickets={expiredTickets} />}
        {activeTab === "CLOSED" && <ClosedTickets tickets={closedTickets} />}
      </div>
    </div>
  );
}
