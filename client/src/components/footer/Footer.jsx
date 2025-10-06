import styles from "./Footer.module.css";
import FooterContact from "./FooterContact";
import FooterLogo from "./FooterLogo";
import FooterLocation from "./FooterLocation";

import logo from "../../assets/ck-logo.png"; // ← replace with your logo path

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterContact
        phone="+972524143584"
        instagram="https://www.instagram.com/nailsbychristeen/"
        whatsapp="https://wa.me/972524143584"
        email="info@nailsbychristeen.com"
      />
      <FooterLogo src={logo} alt="Nails by Christeen logo" />
      <FooterLocation
        google="https://www.google.com/maps/search/?api=1&query=32.82416602,35.19625783"
        waze="https://waze.com/ul?ll=32.82416602,35.19625783&navigate=yes"
      />
    </footer>
  );
}
