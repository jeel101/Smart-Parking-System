import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function AdminFloor() {
  const parkingLotId = 1;

  const [floors, setFloors] = useState([]);
  const [floorCount, setFloorCount] = useState(0);
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

  const handleAddFloor = async () => {
    setCreating(true);
    try {
      await apiClient.post(`/floor/create-floor/${parkingLotId}`);
      toast.success("Floor created");
      await fetchFloors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create floor");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {/* Body */}
      <div className="p-6 space-y-4">
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
              Add your first floor to start creating slots on it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {floors.map((floor) => (
              <div
                key={floor.id}
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
        )}

        <button
          onClick={handleAddFloor}
          disabled={creating}
          className="w-full bg-clay text-white font-display font-semibold py-3 rounded-lg hover:bg-ink transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {creating ? "Adding floor…" : "Add Floor"}
        </button>
      </div>
    </div>
  );
}
