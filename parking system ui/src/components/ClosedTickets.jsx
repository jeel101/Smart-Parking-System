import React from "react";
import TicketCard from "./TicketCard";
import EmptyState from "./EmptyState";

export default function ClosedTickets({ tickets }) {
  if (!tickets.length) {
    return (
      <EmptyState
        label="No closed tickets"
        hint="Completed and paid tickets will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.ticketNumber}
          ticket={ticket}
          showUnpark={false}
        />
      ))}
    </div>
  );
}
