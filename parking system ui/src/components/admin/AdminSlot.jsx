import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function AdminFloor() {
  const parkingLotId = 1;

  const [floors, setFloors] = useState([]);
  const [floorCount, setFloorCount] = useState(0);

  const [totalFloors, setTotalFloors] = useState(1);
  const [slotsPerFloor, setSlotsPerFloor] = useState(10);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchFloors = async () => {
    try {
      const [floorsRes, countRes] = await Promise.all([
        apiClient.get(`/floor/parking-lot/${parkingLotId}`),
        apiClient.get(`/floor/${parkingLotId}/count`),
      ]);

      setFloors(floorsRes.data);
      setFloorCount(countRes.data);
    } catch (err) {
      toast.error("Failed to load floors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleCreateSetup = async () => {
    if (totalFloors < 1 || slotsPerFloor < 1) {
      toast.error("Please enter valid numbers");
      return;
    }

    setCreating(true);

    try {
      await apiClient.post(`/floor/create-setup/${parkingLotId}`, null, {
        params: {
          totalFloors: totalFloors,
          slotsPerFloor: slotsPerFloor,
        },
      });

      toast.success("Parking setup created successfully");

      await fetchFloors();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create parking setup",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="p-6 space-y-5">
        {/* Existing floors */}
        {loading ? (
          <p className="text-sm text-slate text-center py-10">
            Loading floors…
          </p>
        ) : floors.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-display font-semibold text-dark/70">
              No floors yet
            </p>

            <p className="text-sm text-slate mt-1">
              Create your parking setup below.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="font-display font-semibold text-dark">Floors</p>

              <p className="text-sm text-slate">
                {floorCount} floor{floorCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {floors.map((floor) => (
                <div
                  key={floor.floorId || floor.id}
                  className="rounded-xl border border-slate/15 bg-base px-4 py-3"
                >
                  <p className="text-[10px] text-slate uppercase tracking-wide">
                    Floor
                  </p>

                  <p className="font-mono font-semibold text-dark text-lg">
                    {floor.floorNum}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parking setup form */}
        <div className="border border-slate/15 rounded-xl p-5 space-y-4">
          <div>
            <p className="font-display font-semibold text-dark">
              Create Parking Setup
            </p>

            <p className="text-sm text-slate mt-1">
              Choose the number of floors and slots per floor.
            </p>
          </div>

          {/* Number of floors */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Number of Floors
            </label>

            <input
              type="number"
              min="1"
              value={totalFloors}
              onChange={(e) => setTotalFloors(Number(e.target.value))}
              disabled={creating}
              className="w-full border border-slate/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-clay"
            />
          </div>

          {/* Slots per floor */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Slots Per Floor
            </label>

            <input
              type="number"
              min="1"
              value={slotsPerFloor}
              onChange={(e) => setSlotsPerFloor(Number(e.target.value))}
              disabled={creating}
              className="w-full border border-slate/20 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-clay"
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-slate/5 px-4 py-3 text-sm text-slate">
            This will create{" "}
            <span className="font-semibold text-dark">
              {totalFloors * slotsPerFloor}
            </span>{" "}
            total parking slots.
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateSetup}
            disabled={creating}
            className="w-full bg-clay text-white font-display font-semibold py-3 rounded-lg hover:bg-ink transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {creating ? "Creating Parking Setup…" : "Create Parking Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}
