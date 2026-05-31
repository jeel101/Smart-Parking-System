import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { FaCar, FaMotorcycle, FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { validateReservationDates } from "../utils/validation";
import { getEndDateLimits } from "../utils/calendarValidation";

export default function Slot() {
  const parkingLotId = 1;
  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  // form fields
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [reservationType, setReservationType] = useState("INSTANT");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const navigate = useNavigate();

  // Fetch all floors of parking lot
  useEffect(() => {
    const fetchFloors = async () => {
      try {
        const res = await apiClient.get(`/slot/parking-lot/${parkingLotId}`);

        setFloors(res.data);

        // auto select first floor
        if (res.data.length > 0) {
          setFloorId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFloors();
  }, []);

  // Fetch slots when floor changes
  useEffect(() => {
    if (!floorId) return;

    // reservation bookings must first select dates
    if (reservationType !== "INSTANT" && (!startTime || !endTime)) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        let res;

        // reservation bookings
        if (reservationType !== "INSTANT") {
          res = await apiClient.get(`/slot/available`, {
            params: {
              floorId,
              startTime: `${startTime}T00:00:00`,
              endTime: `${endTime}T00:00:00`,
            },
          });
        }

        // instant bookings
        else {
          const now = new Date();
          const oneMinuteLater = new Date(Date.now() + 60000);

          res = await apiClient.get(`/slot/available`, {
            params: {
              floorId,
              //send current time
              startTime: formatLocalDateTime(now),
              endTime: formatLocalDateTime(oneMinuteLater), // +1 min
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

  const getIcon = (type) => {
    if (type === "CAR") return <FaCar />;
    if (type === "BIKE") return <FaMotorcycle />;
    if (type === "TRUCK") return <FaTruck />;
    return null;
  };

  //local date time for instant booking validation
  const formatLocalDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // park by selected slot
  const handleParkBySlot = async () => {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    if (!vehicleNumber) {
      toast.error("Enter vehicle number");
      return;
    }
    //dates validatrion for reservation
    if (!validateReservationDates(reservationType, startTime, endTime)) return;

    try {
      const res = await apiClient.post("/vehicle/park-by-slot", {
        vehicleNumber,
        slotId: selectedSlot.slotId,
        bookingType: reservationType,
        startTime:
          reservationType !== "INSTANT" ? `${startTime}T00:00:00` : null,
        endTime: reservationType !== "INSTANT" ? `${endTime}T00:00:00` : null,
      });

      // save ticket
      const oldTickets = JSON.parse(localStorage.getItem("tickets")) || [];

      oldTickets.push(res.data);

      localStorage.setItem("tickets", JSON.stringify(oldTickets));

      //refresh slots
      let updated;

      if (reservationType !== "INSTANT" && startTime && endTime) {
        updated = await apiClient.get(`/slot/available`, {
          params: {
            floorId,

            startTime: `${startTime}T00:00:00`,

            endTime: `${endTime}T00:00:00`,
          },
        });
      } // CHANGED: instant booking refresh
      else {
        const now = new Date();
        const oneMinuteLater = new Date(Date.now() + 60000);

        updated = await apiClient.get(`/slot/available`, {
          params: {
            floorId,
            startTime: formatLocalDateTime(now),
            endTime: formatLocalDateTime(oneMinuteLater),
          },
        });
      }

      setSlots(updated.data);

      toast.success("Vehicle parked successfully");
      setTimeout(() => {
        navigate("/tickets");
      }, 1500);

      // reset
      setVehicleNumber("");
      setSelectedSlot(null);
      // setStartTime("");
      // setEndTime("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Parking failed");
    }
  };

  return (
    <div className="min-h-screen bg-base p-8 max-w-6xl mx-auto">
      {/* TITLE */}

      <h2 className="text-3xl font-bold mb-6">Parking Lot {parkingLotId}</h2>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        {/* FLOOR */}
        <select
          value={floorId}
          onChange={(e) => setFloorId(e.target.value)}
          className="p-3 border rounded-lg shadow-sm"
        >
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              Floor {floor.floorNum}
            </option>
          ))}
        </select>

        {/* RESERVATION TYPE */}
        <select
          value={reservationType}
          onChange={(e) => {
            setReservationType(e.target.value);

            // reset dates
            setStartTime("");
            setEndTime("");

            // clear slots temporarily
            setSlots([]);
          }}
          className="p-3 border rounded-lg"
        >
          <option value="INSTANT">INSTANT</option>

          <option value="DAILY">DAILY</option>

          <option value="WEEKLY">WEEKLY</option>

          <option value="MONTHLY">MONTHLY</option>
        </select>

        {/* DATES */}
        {reservationType !== "INSTANT" && (
          <>
            {/* START DATE */}
            <input
              type="date"
              value={startTime}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartTime(e.target.value)}
              className="p-3 border rounded-lg"
            />

            {/* END DATE */}
            <input
              type="date"
              value={endTime}
              min={getEndDateLimits(reservationType, startTime).min}
              max={getEndDateLimits(reservationType, startTime).max}
              onChange={(e) => setEndTime(e.target.value)}
              className="p-3 border rounded-lg"
            />
          </>
        )}
      </div>

      {/* SLOTS GRID */}

      <div className="grid grid-cols-5 gap-5">
        {slots.length === 0 && reservationType !== "INSTANT" && (
          <p className="text-lg">Select dates to view available slots</p>
        )}

        {/* CHANGED: no slots available */}
        {reservationType !== "INSTANT" &&
          startTime &&
          endTime &&
          slots.length === 0 && (
            <p className="text-lg text-red-500">
              No slots available for selected dates
            </p>
          )}

        {slots.map((slot) => {
          const isAvailable = slot.available;

          return (
            <div
              key={slot.slotId}
              onClick={() => slot.available && setSelectedSlot(slot)}
              className={`
                w-28 h-28 rounded-xl border shadow-md
                flex flex-col items-center justify-center
                transition
                ${
                  // CHANGED: available slot
                  slot.reason === "AVAILABLE"
                    ? "bg-[#08CB00] cursor-pointer hover:scale-105"
                    : slot.reason === "RESERVED"
                      ? "bg-[#FFD700] opacity-90 cursor-not-allowed"
                      : "bg-[#FF3737] opacity-90 cursor-not-allowed"
                }
              `}
            >
              {/* ICON */}
              <div className="text-xl mb-2">{getIcon(slot.slotType)}</div>

              {/* SLOT NUMBER */}
              <p className="text-sm font-semibold">{slot.slotNum}</p>

              {/* STATUS */}
              <p className="text-xs font-medium">{slot.reason}</p>
            </div>
          );
        })}
      </div>

      {/* ============================================ */}
      {/* MODAL */}
      {/* ============================================ */}

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-5">Park by Selected Slot</h2>

            <div className="space-y-4">
              <p>
                <strong>Selected Slot:</strong> {selectedSlot.slotNum}
              </p>

              <p>
                <strong>Vehicle Type:</strong> {selectedSlot.slotType}
              </p>

              <p>
                <strong>Reservation:</strong> {reservationType}
              </p>

              {reservationType !== "INSTANT" && (
                <p>
                  <strong>Dates:</strong> {startTime} → {endTime}
                </p>
              )}

              {/* VEHICLE NUMBER */}
              <input
                type="text"
                placeholder="Vehicle Number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full p-3 border rounded-lg"
              />

              {/* BUTTONS */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleParkBySlot}
                  className="flex-1 bg-primary py-3 rounded-lg hover:bg-accent"
                >
                  Confirm
                </button>

                <button
                  onClick={() => {
                    setSelectedSlot(null);

                    setVehicleNumber("");
                  }}
                  className="flex-1 bg-gray-300 py-3 rounded-lg hover:bg-gray-400"
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
