import React from "react";

export default function TicketCard({ ticket, showUnpark, onUnpark }) {
  return (
    <div className="bg-light p-6 rounded-2xl shadow-md">
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

        {ticket.status === "EXPIRED" && (
          <p className="text-yellow-500 font-bold">⚠ Payment Pending</p>
        )}

        {showUnpark && (
          <button
            onClick={() => onUnpark(ticket.ticketNumber)}
            className="mt-4 w-full bg-primary py-2 rounded-lg hover:bg-accent"
          >
            Unpark Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
