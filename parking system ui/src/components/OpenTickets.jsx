import React from "react";
import TicketCard from "./TicketCard";
import { toast } from "react-toastify";
import { unparkVehicle } from "../services/UnParkService";
import EmptyState from "./EmptyState";

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
    return <EmptyState label="No open tickets" hint="Vehicles you park will show up here." />;
  }

  return (
    <div className="grid gap-4">
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