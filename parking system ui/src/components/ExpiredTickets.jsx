import React from "react";
import TicketCard from "./TicketCard";
import EmptyState from "./EmptyState";
import { toast } from "react-toastify";
import { createExitPaymentOrder } from "../services/PaymentService";
import { openRazorpayCheckout } from "../services/RazorpayService";

export default function ExpiredTickets({ tickets, refreshTickets }) {
  const handleUnpark = async (ticketNumber) => {
    try {
      await openRazorpayCheckout({
        createOrder: () => createExitPaymentOrder(ticketNumber),
        description: `Exit payment for ${ticketNumber}`,
        onSuccess: (ticket) => {
          toast.success(`Ticket closed — ₹${ticket.price} paid`);
          refreshTickets?.();
        },
        onDismiss: () => {
          toast.info("Payment cancelled — ticket stays pending");
        },
      });
    } catch (err) {
      toast.error("Unable to start exit payment");
    }
  };

  if (!tickets.length) {
    return (
      <EmptyState
        label="No expired tickets"
        hint="Reservations that ran past their end time land here."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => {
        const isInstant = ticket.reservationType === "INSTANT";
        return (
          <TicketCard
            key={ticket.ticketNumber}
            ticket={ticket}
            showUnpark={isInstant}
            onUnpark={
              isInstant ? () => handleUnpark(ticket.ticketNumber) : undefined
            }
          />
        );
      })}
    </div>
  );
}
