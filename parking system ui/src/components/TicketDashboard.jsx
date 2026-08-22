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
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h1 className="font-display text-2xl font-bold text-dark">
            Parking Tickets
          </h1>
          <p className="text-xs text-slate font-mono uppercase tracking-widest">
            Auto-refreshes every 30s
          </p>
        </div>

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
        {activeTab === "EXPIRED" && (
          <ExpiredTickets
            tickets={expiredTickets}
            refreshTickets={fetchTickets}
          />
        )}
        {activeTab === "CLOSED" && <ClosedTickets tickets={closedTickets} />}
      </div>
    </div>
  );
}
