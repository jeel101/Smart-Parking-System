import React, { useState, useEffect } from "react";
import { unparkVehicle } from "../services/UnParkService";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";
import "react-toastify/dist/ReactToastify.css";

export default function TicketPage() {
  // const [tickets, setTickets] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [expiredTickets, setExpiredTickets] = useState([]);
  const [closedTickets, setClosedTickets] = useState([]);

  //fetch latest tickets from backend
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

  //auto refresh
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => {
      fetchTickets();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  //unpark
  const handleUnpark = async (ticketNumber) => {
    try {
      const message = await unparkVehicle(ticketNumber);
      toast.success(message);
      fetchTickets(); // Refresh tickets after unparking
    } catch (err) {
      toast.error(err.response?.data?.message || "Unparking failed");
    }
  };

  //ticket card component
  const renderTicketCard = (ticket, showUnpark = false) => (
    <div
      key={ticket.ticketNumber}
      className="bg-light p-6 rounded-2xl shadow-md"
    >
      <div className="space-y-2 text-dark">
        <p>
          <strong>Ticket No:</strong> {ticket.ticketNumber}
        </p>

        <p>
          <strong>Vehicle Number:</strong> {ticket.vehicleNumber}
        </p>

        <p>
          <strong>Vehicle Type:</strong> {ticket.vehicleType}
        </p>

        <p>
          <strong>Slot Number:</strong> {ticket.slotNumber}
        </p>

        <p>
          <strong>Reservation Type:</strong> {ticket.reservationType}
        </p>

        <p>
          <strong>Entry Time:</strong>{" "}
          {ticket.entryTime
            ? new Date(ticket.entryTime).toLocaleString()
            : "N/A"}
        </p>

        <p>
          <strong>Exit Time:</strong>{" "}
          {ticket.exitTime
            ? new Date(ticket.exitTime).toLocaleString()
            : "Not Yet"}
        </p>

        <p>
          <strong>Duration:</strong>{" "}
          {ticket.duration ? `${ticket.duration} hrs` : "Pending"}
        </p>

        <p>
          <strong>Price:</strong> ₹{ticket.price || 0}
        </p>

        <p>
          <strong>Status:</strong> {ticket.status}
        </p>

        {/* EXPIRED */}
        {ticket.status === "EXPIRED" && (
          <p className="text-yellow-500 font-bold">⚠ Payment Pending</p>
        )}

        {/* CLOSED */}
        {ticket.status === "CLOSED" && (
          <p className="text-green-500 font-bold">✓ Closed</p>
        )}

        {/* OPEN */}
        {showUnpark && (
          <button
            onClick={() => handleUnpark(ticket.ticketNumber)}
            className="mt-4 w-full bg-primary py-2 rounded-lg hover:bg-accent"
          >
            Unpark Vehicle
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        🎫 Parking Tickets
      </h2>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* OPEN */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-green-600">
            🟢 Open Tickets
          </h3>

          {openTickets.length ? (
            <div className="grid gap-6">
              {[...openTickets]
                .reverse()
                .map((ticket) => renderTicketCard(ticket, true))}
            </div>
          ) : (
            <p>No Open Tickets</p>
          )}
        </div>

        {/* EXPIRED */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-yellow-500">
            🟡 Expired Tickets
          </h3>

          {expiredTickets.length ? (
            <div className="grid gap-6">
              {[...expiredTickets]
                .reverse()
                .map((ticket) => renderTicketCard(ticket))}
            </div>
          ) : (
            <p>No Expired Tickets</p>
          )}
        </div>

        {/* CLOSED */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-600">
            ⚫ Closed Tickets
          </h3>

          {closedTickets.length ? (
            <div className="grid gap-6">
              {[...closedTickets]
                .reverse()
                .map((ticket) => renderTicketCard(ticket))}
            </div>
          ) : (
            <p>No Closed Tickets</p>
          )}
        </div>
      </div>
    </div>
  );
}
