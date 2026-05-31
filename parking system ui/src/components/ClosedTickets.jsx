import React from "react";
import TicketCard from "./TicketCard";

export default function ClosedTickets({ tickets }) {
  if (!tickets.length) {
    return <p>No Closed Tickets</p>;
  }

  return (
    <div className="grid gap-6 max-w-5xl mx-auto">
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
