import { Outlet, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <div className="min-h-screen bg-base">
        {/* Header */}
        <div className="bg-primary text-black p-4 flex justify-between">
          <h1 className="font-bold">Parking System</h1>

          <div className="flex gap-4">
            <Link to="/admin">Admin</Link>
            <Link to="/slots">User</Link>
          </div>
        </div>

        {/* Page Content */}
        <ToastContainer>
          theme="colored" position="top-centre" autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick pauseOnHover draggable theme="light"
        </ToastContainer>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default App;
