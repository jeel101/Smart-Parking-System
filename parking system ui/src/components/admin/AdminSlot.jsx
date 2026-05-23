import React from "react";
import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";

export default function Slot() {
  const [floorId, setFloorId] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [floors, setFloors] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSlotCount, setTotalSlotCount] = useState(0);
  const parkingLotId = 1;

  const handleCreateSlots = async () => {
    await apiClient.post(
      `/slot/create-slot/${floorId}?totalSlots=${totalSlots}`,
    );
    alert("Slots created!");
  };

  // fetch floors
  useEffect(() => { 
    const fetchFloors = async () => {
      try {
        const res = await apiClient.get(`/floor/parking-lot/${parkingLotId}`);
        setFloors(res.data);
      } catch (err) {
        console.log("floors:", floors);
        console.error(err);
      }
    };
    fetchFloors();
  }, []);

  //fetch count of all slots within parking lot
  useEffect(() => {
    const fetchTotalParkingSlots = async () => {
      try {
        const res = await apiClient.get(
          `/slot/parking-lot/${parkingLotId}/count`,
        );
        setTotalSlotCount(res.data);
      } catch (err) {
        console.error("total parking lot error:", err);
      }
    };

    fetchTotalParkingSlots();
  }, []);

  useEffect(() => {
    if (!floorId) return;
    const fetchSlotData = async () => {
      try {
        const [availableCountRes, totalRes] = await Promise.all([
          apiClient.get(`/slot/floor/${floorId}/available/count`), //count of all available slots within floor
          apiClient.get(`/slot/floor/${floorId}/count`), //count all slots within floor
        ]);

        setAvailableCount(availableCountRes.data);
        setTotalCount(totalRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSlotData();
  }, [floorId]);

  return (
    <div className="min-h-screen bg-base flex flex-col items-center p-8 gap-8">
      {/* Create Slots Card */}
      <div className="bg-light p-8 rounded-2xl shadow-md border w-full max-w-md">
        <h2 className="text-2xl font-bold text-dark text-center mb-6">
          Create Slots
        </h2>

        <div className="space-y-4">
          <select
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent"
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                Floor {floor.floorNum}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={totalSlots}
            onChange={(e) => setTotalSlots(e.target.value)}
            placeholder="Total Slots"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent"
          />

          <button
            className="w-full bg-primary text-black py-2 rounded-lg hover:bg-accent"
            onClick={handleCreateSlots}
          >
            Create Slots
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {floorId && (
        <div className="flex gap-8 items-center">
          {/* Ratio Box */}
          <div className="bg-primary p-6 rounded-xl shadow-md w-56 text-center">
            <p className="text-3xl font-bold">
              {availableCount} / {totalCount}
            </p>
            <p className="text-sm mt-2">Available / Total</p>
          </div>
        </div>
      )}

      {/* Details Box */}
      <div className="bg-light p-6 rounded-xl shadow-md w-56 text-center border border-accent">
        <p className="text-sm text-dark mb-2">Total Slots</p>
        <p className="text-3xl font-bold text-accent">{totalSlotCount}</p>
      </div>
    </div>
  );
}
