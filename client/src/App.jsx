import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer/Footer";
//admins pages
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import PageNotFound from "./pages/auth/pageNotFound/PageNotFound";
import SchedulePage from "./pages/admin/schedule/SchedulePage";
import AdminsAppointmentsPage from "./pages/admin/appointments/AppointmentsPage";
import AdminsReportsPage from "./pages/admin/reports/ReportsPage";
import AdminsUsersPage from "./pages/admin/users/UsersPage";
import AdminsStocksPage from "./pages/admin/stock/StockPage";
//users pages
import UserHomePage from "./pages/user/homePage/UserHomePage";
import UserAppointmentsPage from "./pages/user/usersAppointments/UserAppointmentsPage";
import UserProfilePage from "./pages/user/profile/UserProfilePage";
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
          <Route path="/" element={<UserHomePage />} />
          <Route path="/myorders" element={<UserAppointmentsPage />} />
          <Route path="/my-profile" element={<UserProfilePage />} />
          <Route path="/admin/schedule" element={<SchedulePage />} />
          <Route path="/admin/users" element={<AdminsUsersPage />} />
          <Route
            path="/admin/appointments"
            element={<AdminsAppointmentsPage />}
          />
          <Route path="/admin/reports" element={<AdminsReportsPage />} />
          <Route path="/admin/stocks" element={<AdminsStocksPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
