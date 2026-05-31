import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminSlot from "./components/admin/AdminSlot.jsx";
import Slot from "./components/Slot.jsx";
import Parking from "./components/Parking.jsx";
import PakringDashboard from "./components/PakringDashboard.jsx";
import TicketDashboard from "./components/TicketDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/admin",
        element: <AdminSlot />,
      },
      {
        path: "/ticket-dashboard",
        element: <TicketDashboard />,
      },
      {
        path: "/parking-dashboard",
        element: <PakringDashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
