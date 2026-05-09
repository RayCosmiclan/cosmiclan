"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { markCosmiclanPublicSeen } from "./cosmiclan-public-session";
import { Highlight, RevealText } from "./reveal-text";
import styles from "./cosmiclan-pages.module.css";

type LoopStep = { step: string; essence: string; detail: string };
type LoopCopy = {
  kicker: string;
  heading: string;
  outroStrong: string;
  outro: string;
};

type Member = {
  name: string;
  role: string;
  focus: string;
  code: string;
  image: string;
  kind: "Leader" | "Agent";
};

type SocialLink = { name: string; handle: string; url: string };

type ContactCopy = {
  kicker: string;
  heading: string;
  email: string;
  socialsHeading: string;
};

type LeaderVenture = { name: string; role: string; description: string };
type LeaderFact = { label: string; value: string };

type Leader = {
  name: string;
  role: string;
  focus: string;
  image: string;
  bio: string[];
  location: { city: string; country: string; line: string };
  ventures: LeaderVenture[];
  facts: LeaderFact[];
  venturesHeading: string;
  backgroundHeading: string;
};

type AboutCopy = {
  aboutLabel: string;
  workLabel: string;
  blogsLabel: string;
  contactLabel: string;
  title: string;
  titleAccent: string;
  aboutOrganism: string;
  heroLines: [string, string];
  leaderKicker: string;
  baseLabel: string;
  aboutGrid: [string, string];
  servicesKicker: string;
  servicesHeading: string;
  teamKicker: string;
  teamHeading: string;
  socialsKicker: string;
  socialsHeading: string;
  aboutGridProcess: string;
};

export function AboutContent({
  copy,
  leader,
  team,
  loopSteps,
  loopCopy,
  services,
  socialLinks,
  contactCopy,
  timeLocale,
}: {
  copy: AboutCopy;
  leader: Leader;
  team: Member[];
  loopSteps: LoopStep[];
  loopCopy: LoopCopy;
  services: string[];
  socialLinks: SocialLink[];
  contactCopy: ContactCopy;
  timeLocale: "id" | "default";
}) {
  const [, ...agents] = team;
  const [activeStep, setActiveStep] = useState(0);
  const [loopPaused, setLoopPaused] = useState(false);
  const loopSectionRef = useRef<HTMLElement>(null);
  const [loopVisible, setLoopVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-boot]",
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 0.78,
          ease: "power3.out",
          stagger: 0.055,
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    markCosmiclanPublicSeen();

    const node = loopSectionRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setLoopVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.18 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!loopVisible || loopPaused) return;
    const tick = window.setInterval(() => {
      setActiveStep((s) => (s + 1) % loopSteps.length);
    }, 4200);
    return () => window.clearInterval(tick);
  }, [loopVisible, loopPaused, loopSteps.length]);
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    const isID = timeLocale === "id";
    const formatter = new Intl.DateTimeFormat(isID ? "id-ID" : "en-IN", {
      timeZone: isID ? "Asia/Jakarta" : "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const prefix = isID ? "WIB" : "IST";
    const tick = () =>
      setTimeLabel(`${prefix} ${formatter.format(new Date())}`);
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [timeLocale]);

  return (
    <main ref={rootRef} className={styles.subpage}>
      <div className={styles.ambientField} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Cosmiclan navigation">
        <div data-boot className={styles.navGroup}>
          <Link href="/">{copy.workLabel}</Link>
          <Link href="/about" aria-current="page">
            {copy.aboutLabel}
          </Link>
          <Link href="/blogs">{copy.blogsLabel}</Link>
        </div>
        <span data-boot className={styles.navCenter} suppressHydrationWarning>
          {timeLabel}
        </span>
        <div data-boot className={styles.navGroup}>
          <Link href="mailto:gabrielantony56@gmail.com">
            {copy.contactLabel}
          </Link>
        </div>
      </nav>

      <section className={styles.aboutHero}>
        <RevealText as="p" effect="kicker" immediate className={styles.kicker}>
          {copy.aboutOrganism}
        </RevealText>
        <h1 className={styles.subpageTitle}>
          <RevealText as="span" effect="chars" immediate delay={0.15}>
            {copy.title}
          </RevealText>
          <br />
          <Highlight>
            <RevealText as="span" effect="chars" immediate delay={0.45}>
              {copy.titleAccent}
            </RevealText>
          </Highlight>{" "}
          <RevealText as="span" effect="chars" immediate delay={0.6}>
            Output.
          </RevealText>
        </h1>
        <div className={styles.heroStatement}>
          <RevealText
            as="p"
            effect="words"
            accentWords={["Cosmiclan", "agents", "operating", "system"]}
          >
            {copy.heroLines[0]}
          </RevealText>
          {copy.heroLines[1] ? (
            <RevealText as="p" effect="words">
              {copy.heroLines[1]}
            </RevealText>
          ) : (
            <RevealText as="p" effect="words">
              {leader.location.line}
            </RevealText>
          )}
        </div>
      </section>

      <section className={styles.leaderSection} aria-label="Leadership">
        <div className={styles.leaderPortrait}>
          <Image
            src={leader.image}
            alt={leader.name}
            fill
            priority
            sizes="(max-width: 920px) 92vw, 38vw"
          />
        </div>
        <div className={styles.leaderCopy}>
          <RevealText as="p" effect="kicker" className={styles.kicker}>
            {copy.leaderKicker}
          </RevealText>
          <RevealText as="h2" effect="chars">
            {leader.name}
          </RevealText>
          {leader.bio.map((line, i) => (
            <RevealText
              key={i}
              as="p"
              effect="words"
              delay={i * 0.05}
              accentWords={[
                "Gabriel",
                "Cosmiclan",
                "Rax",
                "Larinova",
                "Chennai",
                "India",
                "Eight",
                "agents",
                "operating",
              ]}
            >
              {line}
            </RevealText>
          ))}
          <div className={styles.locationBlock}>
            <span>{copy.baseLabel}</span>
            <strong>
              <Highlight>
                {leader.location.city}, {leader.location.country}
              </Highlight>
            </strong>
          </div>
        </div>
      </section>

      <section className={styles.leaderVentures} aria-label="Ventures">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{leader.venturesHeading}</p>
        </div>
        <div className={styles.ventureGrid}>
          {leader.ventures.map((venture, i) => (
            <article key={venture.name} className={styles.ventureCard}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{venture.name}</h3>
              <p className={styles.ventureRole}>{venture.role}</p>
              <p>{venture.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.leaderBackground} aria-label="Background">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{leader.backgroundHeading}</p>
        </div>
        <dl className={styles.factsList}>
          {leader.facts.map((fact) => (
            <div key={fact.label} className={styles.factRow}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        ref={loopSectionRef}
        className={styles.operatingLoop}
        data-visible={loopVisible}
        data-paused={loopPaused}
        aria-label="The operating loop"
        onMouseEnter={() => setLoopPaused(true)}
        onMouseLeave={() => setLoopPaused(false)}
      >
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{loopCopy.kicker}</p>
          <h2>{loopCopy.heading}</h2>
        </div>

        <div className={styles.loopStage}>
          <div
            className={styles.loopDial}
            style={
              {
                "--active-angle": `${(activeStep / loopSteps.length) * 360}deg`,
              } as CSSProperties
            }
          >
            <svg
              className={styles.loopDialSvg}
              viewBox="0 0 400 400"
              aria-hidden="true"
            >
              <circle
                cx="200"
                cy="200"
                r="178"
                className={styles.loopDialRimOuter}
              />
              <circle
                cx="200"
                cy="200"
                r="172"
                className={styles.loopDialRimInner}
              />
              <circle
                cx="200"
                cy="200"
                r="118"
                className={styles.loopDialCore}
              />
              {loopSteps.map((_, i) => {
                const angle = (i / loopSteps.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const x1 = 200 + 158 * Math.cos(rad);
                const y1 = 200 + 158 * Math.sin(rad);
                const x2 = 200 + 175 * Math.cos(rad);
                const y2 = 200 + 175 * Math.sin(rad);
                return (
                  <line
                    key={`tick-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className={styles.loopDialTickMark}
                    data-active={i === activeStep}
                  />
                );
              })}
              {loopSteps.map((_, i) => {
                const angle = (i / loopSteps.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const x = 200 + 142 * Math.cos(rad);
                const y = 200 + 142 * Math.sin(rad);
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={x}
                    cy={y}
                    r={i === activeStep ? 9 : 5}
                    className={styles.loopDialDot}
                    data-active={i === activeStep}
                    onMouseEnter={() => setActiveStep(i)}
                  />
                );
              })}
              <g className={styles.loopDialPointer}>
                <line
                  x1="200"
                  y1="200"
                  x2="200"
                  y2="32"
                  className={styles.loopDialPointerLine}
                />
                <polygon
                  points="200,22 192,40 208,40"
                  className={styles.loopDialPointerHead}
                />
              </g>
            </svg>

            <ul className={styles.loopDialLabels} aria-hidden="false">
              {loopSteps.map((s, i) => {
                const angle = (i / loopSteps.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const dx = Math.cos(rad);
                const dy = Math.sin(rad);
                return (
                  <li
                    key={s.step}
                    className={styles.loopDialLabel}
                    data-active={i === activeStep}
                    style={
                      {
                        top: `${50 + dy * 49}%`,
                        left: `${50 + dx * 49}%`,
                        "--align-x":
                          dx > 0.2 ? "0%" : dx < -0.2 ? "-100%" : "-50%",
                        "--align-y":
                          dy > 0.2 ? "0%" : dy < -0.2 ? "-100%" : "-50%",
                      } as CSSProperties
                    }
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveStep(i)}
                      onFocus={() => setActiveStep(i)}
                    >
                      <span className={styles.loopDialLabelIndex}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.loopDialLabelName}>{s.step}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className={styles.loopDialCenter}>
              <span className={styles.loopDialCenterIndex}>
                {String(activeStep + 1).padStart(2, "0")}
                <small>/ 06</small>
              </span>
              <span
                key={`name-${activeStep}`}
                className={styles.loopDialCenterName}
              >
                {loopSteps[activeStep].step}
              </span>
              <span className={styles.loopDialCenterStatus}>
                {loopPaused ? "paused" : "running"}
              </span>
            </div>
          </div>

          <aside className={styles.loopDetailPanel} aria-live="polite">
            <p
              key={`essence-${activeStep}`}
              className={styles.loopDetailEssence}
            >
              {loopSteps[activeStep].essence}
            </p>
            <p key={`detail-${activeStep}`} className={styles.loopDetailBody}>
              {loopSteps[activeStep].detail}
            </p>
          </aside>
        </div>

        <p className={styles.loopOutro}>
          <strong>{loopCopy.outroStrong}</strong> {loopCopy.outro}
        </p>
      </section>

      <section className={styles.servicesSection} aria-label="Services">
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{copy.servicesKicker}</p>
          <RevealText as="h2" effect="chars">
            {copy.servicesHeading}
          </RevealText>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service, index) => (
            <span key={service}>
              {String(index + 1).padStart(2, "0")} / {service}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.aboutTeamSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.kicker}>{copy.teamKicker}</p>
          <RevealText as="h2" effect="chars">
            {copy.teamHeading}
          </RevealText>
        </div>
        <div className={styles.teamGrid}>
          {agents.map((member) => (
            <article className={styles.teamCard} key={member.name}>
              {member.image ? (
                <div className={styles.agentPortrait}>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 920px) 44vw, 14vw"
                  />
                </div>
              ) : null}
              <span>{member.code}</span>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <p>{member.focus}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.contactSection} aria-label="Contact">
        <RevealText as="p" effect="kicker" className={styles.kicker}>
          {contactCopy.kicker}
        </RevealText>
        <RevealText as="h2" effect="chars" className={styles.contactHeading}>
          {contactCopy.heading}
        </RevealText>
        <a className={styles.contactEmail} href={`mailto:${contactCopy.email}`}>
          {contactCopy.email}
        </a>
        <ul
          className={styles.contactSocials}
          aria-label={contactCopy.socialsHeading}
        >
          {socialLinks.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                <span>{s.name}</span>
                <em>{s.handle}</em>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
