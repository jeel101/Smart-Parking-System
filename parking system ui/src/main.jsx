import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/Login.jsx";
import AdminSlot from "./components/admin/AdminSlot.jsx";
import Slot from "./components/Slot.jsx";
import Parking from "./components/Parking.jsx";
import PakringDashboard from "./components/PakringDashboard.jsx";
import TicketDashboard from "./components/TicketDashboard.jsx";
import PaymentTest from "./components/PaymentTest.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Header + Outlet + Footer + ToastContainer now live here
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/login",
        element: <Login />,
      },
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
      {
        path: "/payement-test",
        element: <PaymentTest />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
