import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/ck-logo.png";
import LogoLink from "./LogoLink";
import UserBox from "./UserBox";
import MenuToggle from "./MenuToggle";
import NavLinks from "./NavLinks";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // === Load user from localStorage ===
  useEffect(() => {
    try {
      const saved = localStorage.getItem("loggedUser");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({
          username:
            parsed.username || parsed.userName || parsed.first_name || "",
          userRole: parsed.userRole || parsed.role || "user",
        });
      }
    } catch (err) {
      console.error("Failed to parse user:", err);
    }
  }, []);

  // === Listen for login/logout events ===
  useEffect(() => {
    const handler = (e) => setUser(e.detail || null);
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  }, []);

  // === Close menu when route changes ===
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // === Logout ===
  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: null }));
    navigate("/login");
  };

  // === Logo click: manager can switch admin <-> user ===
  const handleLogoClick = () => {
    if (user?.userRole === "manager") {
      if (location.pathname.startsWith("/admin")) {
        navigate("/");
      } else {
        navigate("/admin");
      }
    } else {
      navigate("/");
    }
  };

  const isLoggedIn = !!user?.username;
  const isAdmin = user?.userRole === "manager";
  const onAdminPage = location.pathname.startsWith("/admin");

  return (
    <nav className={styles.navbar}>
      {/* === Left: Logo + Brand === */}
      <div className={styles.navbarLeft}>
        <LogoLink
          src={logo}
          alt="Nails by Christeen Logo"
          onClick={handleLogoClick}
        />
        <div className={styles.brand}>Nails by Christeen</div>
      </div>

      {/* === Center: User Box (only if logged in) === */}
      {isLoggedIn && (
        <div className={styles.navbarCenter}>
          <UserBox userName={user.username} onLogout={handleLogout} />
        </div>
      )}

      {/* === Right: Navigation Links === */}
      <div className={styles.navbarRight}>
        <MenuToggle open={menuOpen} onToggle={() => setMenuOpen((s) => !s)} />
        <NavLinks
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onAdminPage={onAdminPage}
          menuOpen={menuOpen}
          onLinkClick={() => setMenuOpen(false)}
        />
      </div>
    </nav>
  );
}
