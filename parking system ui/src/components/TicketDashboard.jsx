import { React, useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { toast } from "react-toastify";
import OpenTickets from "./OpenTickets";
import ExpiredTickets from "./ExpiredTickets";
import ClosedTickets from "./ClosedTickets";

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

  return (
    <div className="min-h-screen bg-base p-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        🎫 Ticket Dashboard
      </h1>

      <div className="flex gap-6 justify-center mb-10">
        <button
          onClick={() => setActiveTab("OPEN")}
          className="bg-green-500 text-white px-6 py-3 rounded-xl"
        >
          Open ({openTickets.length})
        </button>

        <button
          onClick={() => setActiveTab("EXPIRED")}
          className="bg-yellow-500 text-white px-6 py-3 rounded-xl"
        >
          Expired ({expiredTickets.length})
        </button>

        <button
          onClick={() => setActiveTab("CLOSED")}
          className="bg-gray-600 text-white px-6 py-3 rounded-xl"
        >
          Closed ({closedTickets.length})
        </button>
      </div>

      {activeTab === "OPEN" && (
        <OpenTickets tickets={openTickets} refreshTickets={fetchTickets} />
      )}

      {activeTab === "EXPIRED" && <ExpiredTickets tickets={expiredTickets} />}

      {activeTab === "CLOSED" && <ClosedTickets tickets={closedTickets} />}
    </div>
  );
}
