import React from "react";

const STATUS_CONFIG = {
  OPEN: {
    label: "Active",
    chip: "bg-status-available/15 text-[#0a7a00]",
    dot: "bg-status-available",
  },
  EXPIRED_INSTANT: {
    label: "Payment Pending",
    chip: "bg-status-reserved/20 text-[#8a6d00]",
    dot: "bg-status-reserved",
  },
  EXPIRED_RESERVED: {
    label: "Reservation Ended",
    chip: "bg-slate/15 text-slate",
    dot: "bg-slate",
  },
  CLOSED: { label: "Closed", chip: "bg-slate/15 text-slate", dot: "bg-slate" },
};

function Barcode() {
  return (
    <div
      className="h-8 w-full rounded-sm opacity-70"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--color-ink) 0px, var(--color-ink) 2px, transparent 2px, transparent 4px, var(--color-ink) 4px, var(--color-ink) 5px, transparent 5px, transparent 8px)",
      }}
    />
  );
}

export default function TicketCard({ ticket, showUnpark, onUnpark }) {
  let statusKey = ticket.status;
  if (ticket.status === "EXPIRED") {
    statusKey =
      ticket.reservationType === "INSTANT"
        ? "EXPIRED_INSTANT"
        : "EXPIRED_RESERVED";
  }
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.CLOSED;

  return (
    <div className="flex bg-light rounded-2xl shadow-card border border-slate/10 overflow-hidden">
      {/* ===== MAIN STUB ===== */}
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-display font-semibold tracking-[0.2em] text-clay uppercase">
              Parking Ticket
            </p>
            <p className="font-mono text-lg font-bold text-dark tracking-wide">
              {ticket.ticketNumber}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold ${status.chip}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <Field label="Vehicle No." value={ticket.vehicleNumber} mono />
          <Field label="Type" value={ticket.vehicleType} />
          <Field label="Slot" value={ticket.slotNumber} mono />
          <Field label="Reservation" value={ticket.reservationType} />
          <Field
            label="Entry"
            value={
              ticket.entryTime
                ? new Date(ticket.entryTime).toLocaleString()
                : "N/A"
            }
          />
          <Field
            label="Exit"
            value={
              ticket.exitTime
                ? new Date(ticket.exitTime).toLocaleString()
                : "Not yet"
            }
          />
        </div>
      </div>

      {/* ===== PERFORATED DIVIDER ===== */}
      <div className="relative w-0 flex-shrink-0">
        <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-base" />
        <span className="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-base" />
        <div className="h-full border-l-2 border-dashed border-slate/25" />
      </div>

      {/* ===== TEAR-OFF STUB ===== */}
      <div className="w-44 flex-shrink-0 bg-ink px-5 py-6 flex flex-col justify-between text-white">
        <div>
          <p className="text-[10px] font-display tracking-[0.2em] text-sand/70 uppercase">
            Duration
          </p>
          <p className="font-mono font-semibold">
            {ticket.duration ? `${ticket.duration} hrs` : "Pending"}
          </p>

          <p className="text-[10px] font-display tracking-[0.2em] text-sand/70 uppercase mt-3">
            Fare
          </p>
          <p className="font-display text-2xl font-bold">
            ₹{ticket.price || 0}
          </p>
        </div>

        <Barcode />

        {showUnpark && (
          <button
            onClick={() =>
              onUnpark(ticket.ticketNumber, ticket.reservationType)
            }
            className="mt-4 w-full bg-clay hover:bg-sand hover:text-ink text-white text-sm font-display font-semibold py-2.5 rounded-lg transition"
          >
            Unpark
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="text-[10px] text-slate uppercase tracking-wide">{label}</p>
      <p className={`text-dark font-medium ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}
