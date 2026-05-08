import Link from "next/link";
import { TEAM } from "@/components/public/cosmiclan-site-data";
import styles from "@/components/public/cosmiclan-pages.module.css";

export default function TeamPage() {
  return (
    <main className={styles.subpage}>
      <nav className={styles.nav} aria-label="Cosmiclan navigation">
        <div className={styles.navGroup}>
          <Link href="/">Work,</Link>
          <Link href="/about">About</Link>
        </div>
        <span className={styles.navCenter}>COSMICLAN / TEAM</span>
        <div className={styles.navGroup}>
          <Link href="mailto:gabriel@cosmiclan.com">Contact</Link>
        </div>
      </nav>

      <section className={styles.subpageContent}>
        <h1 className={styles.subpageTitle}>
          Gabriel directs. The clan executes.
        </h1>
        <div className={styles.teamList}>
          {TEAM.map((member) => (
            <article className={styles.teamRow} key={member.name}>
              <span>{member.code}</span>
              <h2>{member.name}</h2>
              <div className={styles.teamMeta}>
                <p>{member.role}</p>
                <p>{member.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
