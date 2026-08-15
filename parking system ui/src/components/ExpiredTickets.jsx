import React from "react";
import TicketCard from "./TicketCard";
import EmptyState from "./EmptyState";

export default function ExpiredTickets({ tickets }) {
  if (!tickets.length) {
    return <EmptyState label="No expired tickets" hint="Reservations that ran past their end time land here." />;
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.ticketNumber} ticket={ticket} showUnpark={false} />
      ))}
    </div>
  );
}