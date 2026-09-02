import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme.css";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Login from "./components/Login.jsx";
import AdminFloor from "./components/admin/AdminManagement.jsx";
import PakringDashboard from "./components/PakringDashboard.jsx";
import TicketDashboard from "./components/TicketDashboard.jsx";

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
        element: <AdminFloor />,
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
