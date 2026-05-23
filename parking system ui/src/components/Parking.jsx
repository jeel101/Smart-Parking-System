import React, { useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { unparkVehicle } from "../services/UnParkService";
import { validateReservationDates } from "../utils/validation";
import { getEndDateLimits } from "../utils/calendarValidation";

export default function Parking() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [ticketNumber, setTicketNumber] = useState("");
  const [reservationType, setReservationType] = useState("INSTANT");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [unparkError, setUnparkError] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  // const parkingLotId = 1; // or dynamic later

  //validation for vehicle number
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

  //park
  const handlePark = async () => {
    if (!validate()) return;

    //dates validatrion for reservation
    if (!validateReservationDates(reservationType, startTime, endTime)) {
      return;
    }

    try {
      const res = await apiClient.post("/vehicle/park", {
        vehicleNumber,
        vehicleType,
        bookingType: reservationType,
        startTime:
          reservationType !== "INSTANT" ? `${startTime}T00:00:00` : null,
        endTime: reservationType !== "INSTANT" ? `${endTime}T00:00:00` : null,
      });
      console.log(res.data);

      // store in localStorage
      const oldTickets = JSON.parse(localStorage.getItem("tickets")) || [];
      oldTickets.push(res.data);
      localStorage.setItem("tickets", JSON.stringify(oldTickets));

      console.log("before toast");
      toast.success("Ticket generated successfully!");
      setTimeout(() => {
        navigate("/tickets");
      }, 2000);
      console.log("after toast");

      // reset
      setVehicleNumber("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error parking vehicle");
    }
  };

  //unpark
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
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <div className="bg-light p-8 rounded-2xl shadow-md w-full max-w-lg space-y-6">
        <h2 className="text-2xl font-bold text-dark text-center">
          Parking System
        </h2>
        {/* ========= PARK ========= */}
        <div className="space-y-4 border-b pb-6">
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => {
              setVehicleNumber(e.target.value.toUpperCase());
              setErrors({ ...errors, vehicleNumber: "" });
            }}
            className={`w-full p-2 border rounded-lg ${
              errors.vehicleNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.vehicleNumber && (
            <p className="text-red-500 text-sm">{errors.vehicleNumber}</p>
          )}
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="CAR">CAR</option>
            <option value="BIKE">BIKE</option>
            <option value="TRUCK">TRUCK</option>
          </select>
          {/* dropwdown for reservation type */}
          <select
            value={reservationType}
            onChange={(e) => setReservationType(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="INSTANT">INSTANT</option>
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </select>

          {/* calendar for start and end time if reservation type is not instant */}
          {reservationType !== "INSTANT" && (
            <>
              <input
                type="date"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />

              <input
                type="date"
                value={endTime}
                min={getEndDateLimits(reservationType, startTime).min}
                max={getEndDateLimits(reservationType, startTime).max}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </>
          )}

          <button
            onClick={handlePark}
            className="w-full bg-primary py-2 rounded-lg hover:bg-accent cursor-pointer"
          >
            Park Vehicle
          </button>
        </div>
        //unpark
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark">Unpark Vehicle</h3>

          <input
            type="text"
            placeholder="Ticket Number"
            value={ticketNumber}
            onChange={(e) => {
              setTicketNumber(e.target.value);
              setUnparkError("");
            }}
            className={`w-full p-2 border rounded-lg ${
              unparkError ? "border-red-500" : "border-gray-300"
            }`}
          />

          {unparkError && <p className="text-red-500 text-sm">{unparkError}</p>}

          <button
            onClick={handleUnpark}
            className="w-full bg-dark text-black py-2 rounded-lg hover:bg-accent cursor-pointer"
          >
            Unpark Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}
