import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

// NOTE: I don't have your FloorController, only FloorImpl (the service layer),
// so I can't confirm the exact REST path for creating a floor. GET
// `/floor/parking-lot/{id}` is already proven to work (you use it in AdminSlot
// and Slot). For POST I've assumed `/floor/add/{parkingLotId}` — check your
// controller and adjust the one line marked below if the path differs.

export default function AdminFloor() {
  const parkingLotId = 1;
  const [floors, setFloors] = useState([]);
  const [floorStats, setFloorStats] = useState({}); // { [floorId]: { available, total } }
  const [loading, setLoading] = useState(false);

  const fetchFloors = async () => {
    try {
      const res = await apiClient.get(`/floor/parking-lot/${parkingLotId}`);
      setFloors(res.data);

      const statsEntries = await Promise.all(
        res.data.map(async (floor) => {
          try {
            const [availableRes, totalRes] = await Promise.all([
              apiClient.get(`/slot/floor/${floor.id}/available/count`),
              apiClient.get(`/slot/floor/${floor.id}/count`),
            ]);
            return [
              floor.id,
              { available: availableRes.data, total: totalRes.data },
            ];
          } catch {
            return [floor.id, { available: 0, total: 0 }];
          }
        }),
      );
      setFloorStats(Object.fromEntries(statsEntries));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load floors");
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleAddFloor = async () => {
    setLoading(true);
    try {
      // ⚠ confirm this path against your FloorController
      await apiClient.post(`/floor/add/${parkingLotId}`);
      toast.success("Floor added!");
      fetchFloors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add floor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-ink rounded-2xl px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.25em] text-sand/80 uppercase">
              Admin / Parking Lot {parkingLotId}
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              Floor Management
            </h2>
          </div>
          <button
            onClick={handleAddFloor}
            disabled={loading}
            className="bg-clay text-white font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-sand hover:text-ink transition disabled:opacity-50"
          >
            {loading ? "Adding…" : "+ Add Floor"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {floors.map((floor) => {
            const stats = floorStats[floor.id] || { available: 0, total: 0 };
            return (
              <div
                key={floor.id}
                className="bg-light rounded-2xl p-5 shadow-card border border-slate/10 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-slate uppercase tracking-wide">
                    Floor
                  </p>
                  <p className="font-display text-xl font-bold text-dark">
                    F{floor.floorNum}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-semibold text-clay">
                    {stats.available}/{stats.total}
                  </p>
                  <p className="text-xs text-slate">available / total</p>
                </div>
              </div>
            );
          })}

          {floors.length === 0 && (
            <div className="sm:col-span-2 text-center py-16 bg-light rounded-2xl border border-dashed border-slate/20">
              <p className="font-display font-semibold text-dark">
                No floors yet
              </p>
              <p className="text-sm text-slate mt-1">
                Add your first floor to start creating slots.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
