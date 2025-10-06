import AdminLinks from "./AdminLinks";
import UserLinks from "./UserLinks";
import GuestLinks from "./GuestLinks";
import styles from "./Navbar.module.css";

export default function NavLinks({
  isLoggedIn,
  isAdmin,
  onAdminPage,
  menuOpen,
  onLinkClick,
}) {
  return (
    <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
      {isLoggedIn ? (
        onAdminPage && isAdmin ? (
          <AdminLinks onLinkClick={onLinkClick} />
        ) : (
          <UserLinks isAdmin={isAdmin} onLinkClick={onLinkClick} />
        )
      ) : (
        <GuestLinks onLinkClick={onLinkClick} />
      )}
    </ul>
  );
}
