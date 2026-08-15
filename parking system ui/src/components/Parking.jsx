import React, { useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { unparkVehicle } from "../services/UnParkService";
import { validateReservationDates } from "../utils/validation";
import { getEndDateLimits } from "../utils/calendarValidation";

export default function Parking() {
  const [mode, setMode] = useState("park"); // "park" | "unpark"

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [reservationType, setReservationType] = useState("INSTANT");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState({});

  const [ticketNumber, setTicketNumber] = useState("");
  const [unparkError, setUnparkError] = useState("");

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const regex = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;

    if (!regex.test(vehicleNumber)) {
      newErrors.vehicleNumber = "Invalid Number";
    }
    if (reservationType !== "INSTANT" && (!startTime || !endTime)) {
      newErrors.date = "Please select start and end time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Requirement 5: auto-correct end date whenever start date changes
  const handleStartTimeChange = (newStart) => {
    setStartTime(newStart);

    const limits = getEndDateLimits(reservationType, newStart);
    if (!endTime) return;

    const endDate = new Date(endTime);
    const minDate = limits.min ? new Date(limits.min) : null;
    const maxDate = limits.max ? new Date(limits.max) : null;

    if ((minDate && endDate < minDate) || (maxDate && endDate > maxDate)) {
      setEndTime(limits.min || "");
    }
  };

  const handlePark = async () => {
    if (!validate()) return;
    if (!validateReservationDates(reservationType, startTime, endTime)) return;

    try {
      const res = await apiClient.post("/vehicle/park", {
        vehicleNumber,
        vehicleType,
        bookingType: reservationType,
        startTime:
          reservationType !== "INSTANT" ? `${startTime}T00:00:00` : null,
        endTime: reservationType !== "INSTANT" ? `${endTime}T00:00:00` : null,
      });

      const oldTickets = JSON.parse(localStorage.getItem("tickets")) || [];
      oldTickets.push(res.data);
      localStorage.setItem("tickets", JSON.stringify(oldTickets));

      toast.success("Ticket generated successfully!");
      setTimeout(() => navigate("/ticket-dashboard"), 2000);

      setVehicleNumber("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error parking vehicle");
    }
  };

  const handleUnpark = async () => {
    if (!ticketNumber) {
      setUnparkError("Enter ticket number");
      return;
    }

    try {
      const message = await unparkVehicle(ticketNumber);
      toast.success(message);
      setTimeout(() => {
        setTicketNumber("");
        setUnparkError("");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unparking failed");
    }
  };

  return (
    <div className="bg-light rounded-2xl shadow-card border border-slate/10 overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-ink px-6 py-5">
        <p className="font-display text-xs tracking-[0.25em] text-sand/80 uppercase">
          Attendant Desk
        </p>
        <h2 className="font-display text-xl font-bold text-white">
          Manual Booking
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate/10">
        {[
          ["park", "Park Vehicle"],
          ["unpark", "Unpark Vehicle"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 py-3 text-sm font-display font-semibold transition
              ${
                mode === key
                  ? "text-clay border-b-2 border-clay bg-sand/5"
                  : "text-dark/50 hover:text-dark"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ========= PARK ========= */}
        {mode === "park" && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Vehicle Number"
                value={vehicleNumber}
                onChange={(e) => {
                  setVehicleNumber(e.target.value.toUpperCase());
                  setErrors({ ...errors, vehicleNumber: "" });
                }}
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40 ${
                  errors.vehicleNumber
                    ? "border-status-occupied"
                    : "border-slate/20"
                }`}
              />
              {errors.vehicleNumber && (
                <p className="text-status-occupied text-xs mt-1">
                  {errors.vehicleNumber}
                </p>
              )}
            </div>

            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full p-2.5 border border-slate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40"
            >
              <option value="CAR">CAR</option>
              <option value="BIKE">BIKE</option>
              <option value="TRUCK">TRUCK</option>
            </select>

            <select
              value={reservationType}
              onChange={(e) => {
                setReservationType(e.target.value);
                setStartTime("");
                setEndTime("");
              }}
              className="w-full p-2.5 border border-slate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40"
            >
              <option value="INSTANT">INSTANT</option>
              <option value="DAILY">DAILY</option>
              <option value="WEEKLY">WEEKLY</option>
              <option value="MONTHLY">MONTHLY</option>
            </select>

            {/* Requirement 4: reservation dates get a distinct highlighted panel */}
            {reservationType !== "INSTANT" && (
              <div className="space-y-3 bg-sand/10 border border-clay/20 rounded-lg p-3 animate-[fadeIn_0.2s_ease]">
                <p className="text-xs font-display font-semibold text-clay uppercase tracking-wide">
                  Reservation Window
                </p>
                <input
                  type="date"
                  value={startTime}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full p-2.5 border border-clay/30 rounded-lg bg-light focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
                <input
                  type="date"
                  value={endTime}
                  min={getEndDateLimits(reservationType, startTime).min}
                  max={getEndDateLimits(reservationType, startTime).max}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2.5 border border-clay/30 rounded-lg bg-light focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
                {errors.date && (
                  <p className="text-status-occupied text-xs">{errors.date}</p>
                )}
              </div>
            )}

            <button
              onClick={handlePark}
              className="w-full bg-clay text-white font-display font-semibold py-3 rounded-lg hover:bg-ink transition"
            >
              Park Vehicle
            </button>
          </div>
        )}

        {/* ========= UNPARK ========= */}
        {mode === "unpark" && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Ticket Number"
                value={ticketNumber}
                onChange={(e) => {
                  setTicketNumber(e.target.value);
                  setUnparkError("");
                }}
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-clay/40 ${
                  unparkError ? "border-status-occupied" : "border-slate/20"
                }`}
              />
              {unparkError && (
                <p className="text-status-occupied text-xs mt-1">
                  {unparkError}
                </p>
              )}
            </div>

            <button
              onClick={handleUnpark}
              className="w-full bg-ink text-white font-display font-semibold py-3 rounded-lg hover:bg-slate transition"
            >
              Unpark Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
