import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { FaCar, FaMotorcycle, FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { validateReservationDates } from "../utils/validation";
import { getEndDateLimits } from "../utils/calendarValidation";
import { openRazorpayCheckout } from "../services/RazorpayService";
import { createPaymentOrder } from "../services/PaymentService";

const RESERVATION_TYPES = ["INSTANT", "DAILY", "WEEKLY", "MONTHLY"];

const STATUS_STYLES = {
  AVAILABLE: {
    card: "bg-status-available/10 border-status-available/40 hover:border-status-available cursor-pointer hover:-translate-y-0.5",
    dot: "bg-status-available animate-pulseDot",
    label: "text-status-available",
  },

  RESERVED: {
    card: "bg-status-reserved/10 border-status-reserved/40 cursor-not-allowed opacity-90",
    dot: "bg-status-reserved",
    label: "text-[#8a6d00]",
  },

  OCCUPIED: {
    card: "bg-status-occupied/10 border-status-occupied/40 cursor-not-allowed opacity-90",
    dot: "bg-status-occupied",
    label: "text-status-occupied",
  },
};

export default function Slot() {
  const parkingLotId = 1;

  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [reservationType, setReservationType] = useState("INSTANT");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  // =========================================================
  // FETCH FLOORS
  // =========================================================

  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await apiClient.get(`/slot/parking-lot/${parkingLotId}`);

        setFloors(res.data);

        if (res.data.length > 0) {
          setFloorId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFloors();
  }, []);

  // =========================================================
  // FORMAT LOCAL DATE TIME
  // =========================================================

  const formatLocalDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1,
    )}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // =========================================================
  // FETCH AVAILABLE SLOTS
  // =========================================================

  useEffect(() => {
    if (!floorId) return;

    if (reservationType !== "INSTANT" && (!startTime || !endTime)) {
      setSlots([]);

      return;
    }

    const fetchSlots = async () => {
      try {
        let res;

        // -----------------------------------------------------
        // RESERVATION
        // -----------------------------------------------------

        if (reservationType !== "INSTANT") {
          res = await apiClient.get(`/slot/available`, {
            params: {
              floorId,

              startTime: `${startTime}T00:00:00`,

              endTime: `${endTime}T00:00:00`,
            },
          });
        }

        // -----------------------------------------------------
        // INSTANT
        // -----------------------------------------------------
        else {
          const now = new Date();

          const oneMinuteLater = new Date(Date.now() + 60000);

          res = await apiClient.get(`/slot/available`, {
            params: {
              floorId,

              startTime: formatLocalDateTime(now),

              endTime: formatLocalDateTime(oneMinuteLater),
            },
          });
        }

        setSlots(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSlots();
  }, [floorId, reservationType, startTime, endTime]);

  // =========================================================
  // SLOT ICON
  // =========================================================

  const getIcon = (type) => {
    if (type === "CAR") return <FaCar />;

    if (type === "BIKE") return <FaMotorcycle />;

    if (type === "TRUCK") return <FaTruck />;

    return null;
  };

  // =========================================================
  // START DATE CHANGE
  // =========================================================

  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);

    const limits = getEndDateLimits(reservationType, newStart);

    if (!endTime) return;

    const endDate = new Date(endTime);

    const minDate = limits.min ? new Date(limits.min) : null;

    const maxDate = limits.max ? new Date(limits.max) : null;

    const isBelowMin = minDate && endDate < minDate;

    const isAboveMax = maxDate && endDate > maxDate;

    if (isBelowMin || isAboveMax) {
      setEndTime(limits.min || "");
    }
  };

  // =========================================================
  // REFRESH SLOTS
  // =========================================================

  const refreshSlots = async () => {
    let res;

    if (reservationType !== "INSTANT" && startTime && endTime) {
      res = await apiClient.get(`/slot/available`, {
        params: {
          floorId,

          startTime: `${startTime}T00:00:00`,

          endTime: `${endTime}T00:00:00`,
        },
      });
    } else {
      const now = new Date();

      const oneMinuteLater = new Date(Date.now() + 60000);

      res = await apiClient.get(`/slot/available`, {
        params: {
          floorId,

          startTime: formatLocalDateTime(now),

          endTime: formatLocalDateTime(oneMinuteLater),
        },
      });
    }

    setSlots(res.data);
  };

  // =========================================================
  // PARK / BOOK SELECTED SLOT
  // =========================================================

  const handleParkBySlot = async () => {
    // -------------------------------------------------------
    // VALIDATE SLOT
    // -------------------------------------------------------

    if (!selectedSlot) {
      toast.error("Please select a slot");

      return;
    }

    // -------------------------------------------------------
    // VALIDATE VEHICLE
    // -------------------------------------------------------

    if (!vehicleNumber) {
      toast.error("Enter vehicle number");

      return;
    }

    // -------------------------------------------------------
    // VALIDATE DATES
    // -------------------------------------------------------

    if (!validateReservationDates(reservationType, startTime, endTime)) {
      return;
    }

    // =======================================================
    // INSTANT PARKING
    // =======================================================

    if (reservationType === "INSTANT") {
      try {
        const res = await apiClient.post("/vehicle/park-by-slot", {
          vehicleNumber,

          slotId: selectedSlot.slotId,

          bookingType: "INSTANT",

          startTime: null,

          endTime: null,
        });

        // Save ticket

        const oldTickets = JSON.parse(localStorage.getItem("tickets")) || [];

        oldTickets.push(res.data);

        localStorage.setItem("tickets", JSON.stringify(oldTickets));

        // Refresh slots

        await refreshSlots();

        toast.success("Ticket generated successfully!");

        setTimeout(() => navigate("/ticket-dashboard"), 1500);

        // Reset form

        setVehicleNumber("");

        setSelectedSlot(null);
      } catch (err) {
        toast.error(err.response?.data?.message || "Parking failed");
      }

      return;
    }

    // =======================================================
    // DAILY / WEEKLY / MONTHLY
    //
    // FLOW:
    //
    // 1. Create temporary booking / hold
    // 2. Create Razorpay order
    // 3. Open Razorpay
    // 4. Payment succeeds
    // 5. Verify payment
    // 6. Receive ticket
    // =======================================================

    try {
      // -----------------------------------------------------
      // CREATE TEMPORARY BOOKING / HOLD
      // -----------------------------------------------------

      const { data: booking } = await apiClient.post("/booking/initiate", {
        vehicleNumber,

        slotId: selectedSlot.slotId,

        bookingType: reservationType,

        startTime: `${startTime}T00:00:00`,

        endTime: `${endTime}T00:00:00`,
      });

      // -----------------------------------------------------
      // OPEN RAZORPAY
      // -----------------------------------------------------

      await openRazorpayCheckout({
        createOrder: () => createPaymentOrder(booking.bookingId),

        description: `Reservation for slot ${selectedSlot.slotNum}`,

        // ===================================================
        // PAYMENT SUCCESS
        // ===================================================

        onSuccess: (ticket) => {
          console.log("TICKET RECEIVED:", ticket);

          // Save ticket

          const oldTickets = JSON.parse(localStorage.getItem("tickets")) || [];

          oldTickets.push(ticket);

          localStorage.setItem("tickets", JSON.stringify(oldTickets));

          toast.success("Payment successful — ticket confirmed!");

          // IMPORTANT:
          // Reset ONLY after successful payment

          setVehicleNumber("");

          setSelectedSlot(null);

          setTimeout(() => navigate("/ticket-dashboard"), 1500);
        },

        // ===================================================
        // PAYMENT CANCELLED
        // ===================================================

        onDismiss: async () => {
          toast.info("Payment cancelled — slot hold will expire shortly");

          await refreshSlots();
        },
      });
    } catch (err) {
      console.error("BOOKING / PAYMENT ERROR:", err);

      toast.error(err.response?.data?.message || "Unable to start booking");
    }
  };

  // =========================================================
  // AVAILABLE COUNT
  // =========================================================

  const availableCount = slots.filter((s) => s.reason === "AVAILABLE").length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="bg-light rounded-2xl shadow-card border border-slate/10 overflow-hidden">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-ink text-base px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xs tracking-[0.25em] text-sand/80 uppercase">
            Parking Lot {parkingLotId}
          </p>

          <h2 className="font-display text-2xl font-bold text-white">
            Live Slot Map
          </h2>
        </div>

        <div className="font-mono bg-black/25 border border-white/10 rounded-lg px-4 py-2 text-right">
          <span className="text-3xl font-semibold text-status-available leading-none">
            {String(availableCount).padStart(2, "0")}
          </span>

          <p className="text-[10px] tracking-widest text-white/60 uppercase mt-0.5">
            open on this floor
          </p>
        </div>
      </div>

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="px-6 pt-5 pb-4 border-b border-slate/10 space-y-4">
        {/* FLOOR */}

        <div className="flex flex-wrap gap-2">
          {floors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setFloorId(floor.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold font-display transition
                  ${
                    String(floorId) === String(floor.id)
                      ? "bg-clay text-white shadow-sm"
                      : "bg-base text-dark/70 border border-slate/15 hover:border-clay/50"
                  }`}
            >
              Floor {floor.floorNum}
            </button>
          ))}
        </div>

        {/* RESERVATION TYPE */}

        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex rounded-lg border border-slate/15 bg-base p-1">
            {RESERVATION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setReservationType(type);

                  setStartTime("");

                  setEndTime("");

                  setSlots([]);
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold font-display rounded-md transition
                    ${
                      reservationType === type
                        ? "bg-ink text-white shadow-sm"
                        : "text-dark/60 hover:text-dark"
                    }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* DATE INPUTS */}

          {reservationType !== "INSTANT" && (
            <div className="flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
              <input
                type="date"
                value={startTime}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="p-2 text-sm border border-clay/40 bg-sand/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40"
              />

              <span className="text-slate text-sm">→</span>

              <input
                type="date"
                value={endTime}
                min={getEndDateLimits(reservationType, startTime).min}
                max={getEndDateLimits(reservationType, startTime).max}
                onChange={(e) => setEndTime(e.target.value)}
                className="p-2 text-sm border border-clay/40 bg-sand/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40"
              />
            </div>
          )}
        </div>

        {/* LEGEND */}

        <div className="flex items-center gap-5 pt-1">
          {[
            ["Available", "status-available"],
            ["Reserved", "status-reserved"],
            ["Occupied", "status-occupied"],
          ].map(([label, color]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs text-dark/60 font-medium"
            >
              <span className={`w-2.5 h-2.5 rounded-full bg-${color}`} />

              {label}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          SLOT GRID
      ===================================================== */}

      <div className="p-6">
        {slots.length === 0 && reservationType !== "INSTANT" && (
          <div className="text-center py-16 text-slate">
            <p className="font-display font-semibold">Select a date range</p>

            <p className="text-sm mt-1">
              Available slots for your dates will appear here.
            </p>
          </div>
        )}

        {reservationType !== "INSTANT" &&
          startTime &&
          endTime &&
          slots.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display font-semibold text-status-occupied">
                No slots available for these dates
              </p>

              <p className="text-sm text-slate mt-1">
                Try a different date range or floor.
              </p>
            </div>
          )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {slots.map((slot) => {
            const style = STATUS_STYLES[slot.reason] || STATUS_STYLES.OCCUPIED;

            const isSelected = selectedSlot?.slotId === slot.slotId;

            return (
              <div
                key={slot.slotId}
                onClick={() => slot.available && setSelectedSlot(slot)}
                className={`relative rounded-xl border-2 bg-light transition-all duration-150
                    ${style.card}
                    ${
                      isSelected
                        ? "ring-2 ring-clay ring-offset-2 ring-offset-light"
                        : ""
                    }
                  `}
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-3">
                  <span className={`w-2 h-2 rounded-full mb-2 ${style.dot}`} />

                  <div className="text-xl text-dark/80">
                    {getIcon(slot.slotType)}
                  </div>

                  <p className="font-mono font-semibold text-sm mt-1 text-dark">
                    {slot.slotNum}
                  </p>
                </div>

                <div className="border-t border-dashed border-slate/25 mx-3" />

                <p
                  className={`text-[11px] font-display font-bold tracking-wide text-center py-2 ${style.label}`}
                >
                  {slot.reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      {selectedSlot && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-light rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* MODAL HEADER */}

            <div className="bg-ink px-6 py-4">
              <h2 className="font-display text-xl font-bold text-white">
                Confirm Parking
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* SLOT INFO */}

              <div className="flex items-center justify-between bg-base rounded-lg px-4 py-3 border border-slate/10">
                <div>
                  <p className="text-xs text-slate uppercase tracking-wide">
                    Slot
                  </p>

                  <p className="font-mono font-semibold text-dark">
                    {selectedSlot.slotNum}
                  </p>
                </div>

                <div className="text-2xl text-clay">
                  {getIcon(selectedSlot.slotType)}
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate uppercase tracking-wide">
                    Type
                  </p>

                  <p className="font-semibold text-dark">{reservationType}</p>
                </div>
              </div>

              {/* DATES */}

              {reservationType !== "INSTANT" && (
                <p className="text-sm text-dark/70">
                  <strong className="text-dark">Dates:</strong> {startTime} →{" "}
                  {endTime}
                </p>
              )}

              {/* VEHICLE */}

              <input
                type="text"
                placeholder="Vehicle Number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full p-3 border border-slate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40"
              />

              {/* BUTTONS */}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleParkBySlot}
                  className="flex-1 bg-clay text-white font-semibold py-3 rounded-lg hover:bg-ink transition"
                >
                  Confirm
                </button>

                <button
                  onClick={() => {
                    setSelectedSlot(null);

                    setVehicleNumber("");
                  }}
                  className="flex-1 bg-base text-dark font-semibold py-3 rounded-lg border border-slate/15 hover:bg-slate/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
