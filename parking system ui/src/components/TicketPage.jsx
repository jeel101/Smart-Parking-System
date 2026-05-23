import React, { useState } from "react";
import { unparkVehicle } from "../services/UnParkService";
import { toast } from "react-toastify";

export default function TicketPage() {
  const stored = localStorage.getItem("tickets");
  const [tickets, setTickets] = useState(
    JSON.parse(localStorage.getItem("tickets")) || [],
  );

  if (!stored) {
    return <p className="text-center mt-10">No ticket found</p>;
  }

  if (!tickets.length) {
    return <p className="text-center mt-10 text-lg">No tickets found</p>;
  }

  //unpark
  const handleUnpark = async (ticketNumber) => {
    try {
      const message = await unparkVehicle(ticketNumber);

      toast.success(message);

      // refresh UI immediately
      const updatedTickets = tickets.filter(
        (ticket) => ticket.ticketNumber !== ticketNumber,
      );

      setTickets(updatedTickets);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unparking failed");
    }
  };

  return (
    <div className="min-h-screen bg-base p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        🎫 Parking Tickets
      </h2>

      <div className="grid gap-6 max-w-5xl mx-auto">
        {[...tickets].reverse().map((ticket, index) => (
          <div key={index} className="bg-light p-6 rounded-2xl shadow-md">
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
                <strong>Status:</strong> {ticket.status || "OPEN"}
              </p>

              <button
                onClick={() => handleUnpark(ticket.ticketNumber)}
                className="mt-4 w-full bg-primary py-2 rounded-lg hover:bg-accent"
              >
                Unpark Vehicle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
