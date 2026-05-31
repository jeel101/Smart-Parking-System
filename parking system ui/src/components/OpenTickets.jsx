import React from "react";
import TicketCard from "./TicketCard";
import { toast } from "react-toastify";
import { unparkVehicle } from "../services/UnParkService";

export default function OpenTickets({ tickets, refreshTickets }) {
  const handleUnpark = async (ticketNumber) => {
    try {
      const message = await unparkVehicle(ticketNumber);
      toast.success(message);
      refreshTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unparking failed");
    }
  };

  if (!tickets.length) {
    return <p>No Open Tickets</p>;
  }

  return (
    <div className="grid gap-6 max-w-5xl mx-auto">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.ticketNumber}
          ticket={ticket}
          showUnpark={true}
          onUnpark={handleUnpark}
        />
      ))}
    </div>
  );
}
