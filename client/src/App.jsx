import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import PageNotFound from "./pages/auth/pageNotFound/PageNotFound";
import SchedulePage from "./pages/admin/schedule/SchedulePage";
import AdminsAppointmentsPage from "./pages/admin/appointments/AppointmentsPage";
import AdminsReportsPage from "./pages/admin/reports/ReportsPage";
import AdminsUsersPage from "./pages/admin/users/UsersPage";
import "./index.css";

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/admin/schedule" element={<SchedulePage />} />
          <Route path="/admin/users" element={<AdminsUsersPage />} />
          <Route
            path="/admin/appointments"
            element={<AdminsAppointmentsPage />}
          />
          <Route path="/admin/reports" element={<AdminsReportsPage />} />
          <Route
            path="/"
            element={
              <div style={{ textAlign: "center", marginTop: "4rem" }}>
                <h1>Welcome to Nails by Christeen 💅</h1>
                <p>Use the navigation above to explore.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
