import React from "react";
import TicketCard from "./TicketCard";
import { toast } from "react-toastify";
import { unparkVehicle } from "../services/UnParkService";
import EmptyState from "./EmptyState";
import { createExitPaymentOrder } from "../services/PaymentService";
import { openRazorpayCheckout } from "../services/RazorpayService";

export default function OpenTickets({ tickets, refreshTickets }) {
  const handleUnpark = async (ticketNumber, reservationType) => {
    // Reservation tickets already paid at booking time — close directly.
    if (reservationType !== "INSTANT") {
      try {
        const message = await unparkVehicle(ticketNumber);
        toast.success(message);
        refreshTickets();
      } catch (err) {
        toast.error(err.response?.data?.message || "Unparking failed");
      }
      return;
    }

    // INSTANT tickets are unpaid at exit — route through Razorpay first.
    try {
      await openRazorpayCheckout({
        createOrder: () => createExitPaymentOrder(ticketNumber),
        description: `Exit payment for ${ticketNumber}`,
        onSuccess: (ticket) => {
          toast.success(`Ticket closed — ₹${ticket.price} paid`);
          refreshTickets();
        },
        onDismiss: () => {
          toast.info("Payment cancelled — ticket stays open");
        },
      });
    } catch (err) {
      toast.error("Unable to start exit payment");
    }
  };

  if (!tickets.length) {
    return (
      <EmptyState
        label="No open tickets"
        hint="Vehicles you park will show up here."
      />
    );
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
