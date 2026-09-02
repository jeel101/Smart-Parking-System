import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { toast } from "react-toastify";

export default function AdminFloor() {
  const parkingLotId = 1;

  const [floors, setFloors] = useState([]);
  const [floorCount, setFloorCount] = useState(0);

  const [totalSlots, setTotalSlots] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(0);

  const [floorStats, setFloorStats] = useState([]);

  const [totalFloors, setTotalFloors] = useState(1);
  const [slotsPerFloor, setSlotsPerFloor] = useState(10);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchParkingData = async () => {
    try {
      // Get floors, floor count and total slots
      const [floorsRes, countRes, totalSlotsRes] = await Promise.all([
        apiClient.get(`/floor/parking-lot/${parkingLotId}`),
        apiClient.get(`/floor/${parkingLotId}/count`),
        apiClient.get(`/slot/parking-lot/${parkingLotId}/count`),
      ]);

      const fetchedFloors = floorsRes.data;

      setFloors(fetchedFloors);
      setFloorCount(countRes.data);
      setTotalSlots(totalSlotsRes.data);

      // Get stats for every floor
      const stats = await Promise.all(
        fetchedFloors.map(async (floor) => {
          const floorId = floor.floorId ?? floor.id;

          const [totalRes, availableRes] = await Promise.all([
            apiClient.get(`/slot/floor/${floorId}/count`),
            apiClient.get(`/slot/floor/${floorId}/available/count`),
          ]);

          return {
            floorId,
            floorNum: floor.floorNum,
            totalSlots: totalRes.data,
            availableSlots: availableRes.data,
          };
        }),
      );

      setFloorStats(stats);

      // Total available slots in entire parking lot
      const totalAvailable = stats.reduce(
        (sum, floor) => sum + floor.availableSlots,
        0,
      );

      setAvailableSlots(totalAvailable);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load parking information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingData();

    // Refresh dashboard every 10 seconds
    const interval = setInterval(() => {
      fetchParkingData();
    }, 10000);

    return () => clearInterval(interval);
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
          totalFloors,
          slotsPerFloor,
        },
      });

      toast.success("Parking setup created successfully");

      await fetchParkingData();
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "Failed to create parking setup",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="p-5 space-y-5">
        {/* =========================
            TITLE
        ========================== */}
        <div>
          <p className="font-display font-semibold text-dark text-xl">
            Parking Overview
          </p>

          <p className="text-sm text-slate mt-1">
            Monitor floors and parking availability
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate text-center py-10">
            Loading parking information…
          </p>
        ) : (
          <>
            {/* =========================
                SUMMARY
            ========================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Floors */}
              <div className="rounded-xl border border-slate/15 bg-base px-5 py-4">
                <p className="text-xs text-slate uppercase tracking-wide">
                  Floors
                </p>

                <p className="font-mono font-semibold text-dark text-3xl mt-1">
                  {floorCount}
                </p>

                <p className="text-sm text-slate">
                  {floorCount === 1 ? "floor" : "floors"}
                </p>
              </div>

              {/* Available Slots */}
              <div className="rounded-xl border border-slate/15 bg-base px-5 py-4">
                <p className="text-xs text-slate uppercase tracking-wide">
                  Available Slots
                </p>

                <p className="font-mono font-semibold text-dark text-3xl mt-1">
                  {availableSlots}
                  <span className="text-lg text-slate"> / {totalSlots}</span>
                </p>

                <p className="text-sm text-slate">slots currently available</p>
              </div>
            </div>

            {/* =========================
                FLOOR AVAILABILITY
            ========================== */}
            <div className="border border-slate/15 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-display font-semibold text-dark">
                    Floor Availability
                  </p>

                  <p className="text-sm text-slate mt-1">
                    Available slots on each floor
                  </p>
                </div>

                <p className="text-sm text-slate">
                  {floorCount} floor{floorCount !== 1 ? "s" : ""}
                </p>
              </div>

              {floorStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-display font-semibold text-dark/70">
                    No floors yet
                  </p>

                  <p className="text-sm text-slate mt-1">
                    Create your parking setup below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {floorStats.map((floor) => {
                    const percentage =
                      floor.totalSlots > 0
                        ? Math.round(
                            (floor.availableSlots / floor.totalSlots) * 100,
                          )
                        : 0;

                    return (
                      <div
                        key={floor.floorId}
                        className="rounded-xl border border-slate/15 bg-base px-4 py-4"
                      >
                        {/* Floor name */}
                        <p className="text-[10px] text-slate uppercase tracking-wide">
                          Floor
                        </p>

                        <p className="font-mono font-semibold text-dark text-xl mt-1">
                          {floor.floorNum}
                        </p>

                        {/* Availability */}
                        <p className="text-sm text-slate mt-2">
                          <span className="font-semibold text-dark">
                            {floor.availableSlots}
                          </span>{" "}
                          / {floor.totalSlots} available
                        </p>

                        {/* Percentage */}
                        <div className="flex justify-between items-center mt-3">
                          <div className="w-full bg-slate/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-clay h-2 rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="font-mono text-xs font-semibold text-dark ml-3">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =========================
                CREATE PARKING SETUP
            ========================== */}
            <div className="border border-slate/15 rounded-xl p-5 space-y-4">
              <div>
                <p className="font-display font-semibold text-dark">
                  Create Parking Setup
                </p>

                <p className="text-sm text-slate mt-1">
                  Choose the number of floors and slots per floor.
                </p>
              </div>

              {/* Floors */}
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

              {/* Slots */}
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

              {/* Button */}
              <button
                onClick={handleCreateSetup}
                disabled={creating}
                className="w-full bg-clay text-white font-display font-semibold py-3 rounded-lg hover:bg-ink transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? "Creating Parking Setup…" : "Create Parking Setup"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
