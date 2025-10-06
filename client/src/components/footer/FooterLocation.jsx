import { FaMapMarkerAlt } from "react-icons/fa";
import { SiWaze } from "react-icons/si";
import SocialLink from "./SocialLink";
import styles from "./Footer.module.css";

export default function FooterLocation({ google, waze }) {
  return (
    <section className={`${styles.section} ${styles.location}`}>
      <h3>Find Us</h3>
      <SocialLink
        href={google}
        icon={<FaMapMarkerAlt />}
        label="Google Maps"
        external
      />
      <SocialLink href={waze} icon={<SiWaze />} label="Waze" external />
    </section>
  );
}
