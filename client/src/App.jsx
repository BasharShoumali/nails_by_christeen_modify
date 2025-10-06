import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";

import "./index.css";

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
