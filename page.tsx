"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CONFIG } from "./config";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Home() {
  const [opening, setOpening] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const openedRef = useRef(false);

  const [cd, setCd] = useState({ d: "00", h: "00", m: "00", s: "00" });

  /* ============ Lock scroll behind the envelope on first load ============ */
  useEffect(() => {
    document.body.classList.add("locked");
  }, []);

  /* ============ Countdown ============ */
  useEffect(() => {
    function update() {
      const target = new Date(CONFIG.weddingDateISO).getTime();
      let diff = target - Date.now();
      if (diff < 0) diff = 0;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      setCd({ d: pad(d), h: pad(h), m: pad(m), s: pad(s) });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* ============ Scroll reveal ============ */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ============ Envelope gate ============ */
  function openGate() {
    if (openedRef.current) return;
    openedRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpening(true);
    setTimeout(() => {
      setExiting(true);
      document.body.classList.remove("locked");
    }, reducedMotion ? 30 : 700);
    setTimeout(() => {
      setHidden(true);
    }, reducedMotion ? 60 : 1400);
  }

  function handleGateKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openGate();
    }
  }

  /* ============ RSVP → WhatsApp ============ */
  function handleRSVPSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const attending = form.querySelector('input[name="attending"]:checked') as HTMLInputElement | null;
    if (!name || !attending) return;
    const guests = (form.elements.namedItem("guests") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    let text = `تأكيد حضور – دعوة ${CONFIG.groomNameAr} و ${CONFIG.brideNameAr}\n`;
    text += `الاسم: ${name}\n`;
    text += `الحضور: ${attending.value === "yes" ? "حاضرين بكل سرور 🤍" : "للأسف مش هنقدر نحضر"}\n`;
    if (attending.value === "yes") text += `عدد الأشخاص: ${guests}\n`;
    if (message) text += `رسالة: ${message}\n`;

    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  }

  /* ============ Derived values from CONFIG ============ */
  const start = new Date(CONFIG.weddingDateISO);
  const end = new Date(start.getTime() + (CONFIG.durationHours || 4) * 3600 * 1000);

  function toGCal(d: Date) {
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  }

  const gcalText = encodeURIComponent(`${CONFIG.groomNameEn} & ${CONFIG.brideNameEn} Wedding`);
  const gcalDetails = encodeURIComponent("يسعدنا حضوركم حفل زفافنا");
  const addToCalendarHref = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalText}&dates=${toGCal(
    start
  )}/${toGCal(end)}&location=${encodeURIComponent(CONFIG.venueAddress)}&details=${gcalDetails}`;

  const mapFrameSrc = `https://www.google.com/maps?q=${encodeURIComponent(CONFIG.mapQuery)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapQuery)}`;

  const weddingDateAr = start.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weddingDateEn = start.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {/* ============ Envelope intro gate ============ */}
      <div
        className={`gate ${opening ? "opening" : ""} ${exiting ? "exit" : ""}`}
        id="gate"
        tabIndex={0}
        role="button"
        aria-label="افتحوا الدعوة"
        aria-hidden={hidden}
        style={hidden ? { display: "none" } : undefined}
        onClick={openGate}
        onKeyDown={handleGateKeyDown}
      >
        <div className="envelope-scene">
          <div className="envelope-body">
            <div className="gate-pulse"></div>
            <div className="seal">
              <span className="seal__initials" id="seal-initials">
                {CONFIG.groomInitial} &amp; {CONFIG.brideInitial}
              </span>
            </div>
            <div className="envelope-flap"></div>
          </div>
        </div>
        <div className="gate-hint">
          <p className="gate-hint__ar">المسوا هنا لفتح الدعوة</p>
          <p className="gate-hint__en">tap to open</p>
        </div>
      </div>

      <main id="main-content">
        {/* ============ Hero ============ */}
        <section className="hero section wrap reveal" id="hero">
          <p className="hero__bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <div className="rule">
            <span>✦</span>
          </div>
          <p className="section__eyebrow">دعوة زفاف</p>
          <h1 className="hero__names" id="couple-names-ar">
            {CONFIG.groomNameAr} <span className="hero__amp">&amp;</span> {CONFIG.brideNameAr}
          </h1>
          <p className="hero__names-en" id="couple-names-en">
            {CONFIG.groomNameEn} &amp; {CONFIG.brideNameEn}
          </p>
          <p className="hero__line">يسعدنا ويشرفنا حضوركم لمشاركتنا أجمل لحظات العمر</p>
          <p className="hero__date" id="wedding-date-ar">
            {weddingDateAr}
          </p>
          <p className="hero__date-en" id="wedding-date-en">
            {weddingDateEn}
          </p>
          <div className="rule">
            <span>✦</span>
          </div>
          <div className="scroll-cue">
            التفاصيل تحت
            <br />⌄
          </div>
        </section>

        {/* ============ Countdown ============ */}
        <section className="countdown section wrap reveal" id="countdown-section">
          <p className="countdown__lead">الفرح يبدأ خلال</p>
          <div className="countdown__grid">
            <div className="countdown__box">
              <span className="countdown__num" id="cd-days">
                {cd.d}
              </span>
              <span className="countdown__label">أيام</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" id="cd-hours">
                {cd.h}
              </span>
              <span className="countdown__label">ساعات</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" id="cd-mins">
                {cd.m}
              </span>
              <span className="countdown__label">دقائق</span>
            </div>
            <div className="countdown__box">
              <span className="countdown__num" id="cd-secs">
                {cd.s}
              </span>
              <span className="countdown__label">ثواني</span>
            </div>
          </div>
          <a className="add-cal" id="add-to-calendar" href={addToCalendarHref} target="_blank" rel="noopener">
            🤍 أضف الموعد لتقويمك
          </a>
        </section>

        {/* ============ Verse ============ */}
        <section className="verse section wrap reveal" id="verse-section">
          <p className="verse__lead">آية نحملها في قلوبنا</p>
          <p className="verse__ayah">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم
            مَّوَدَّةً وَرَحْمَةً إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
          </p>
          <p className="verse__ref">سورة الروم ﴿٢١﴾</p>
          <p className="verse__gist">
            A line from the Qur&apos;an we hold close — spouses as a source of calm, joined by love and mercy.
          </p>
        </section>

        {/* ============ Timeline / Program ============ */}
        <section className="timeline section wrap reveal" id="timeline-section">
          <p className="section__eyebrow" style={{ textAlign: "center" }}>
            برنامج الحفل
          </p>
          <div className="rule">
            <span>✦</span>
          </div>
          <div className="timeline__list" id="timeline-list">
            {CONFIG.schedule.map((item, i) => (
              <div className="timeline__item" key={i}>
                <div className="timeline__time">{item.time}</div>
                <div className="timeline__label">
                  <span>{item.icon}</span> {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ Location ============ */}
        <section className="location section wrap reveal" id="location-section">
          <p className="section__eyebrow">مكان الاحتفال</p>
          <h2 className="location__venue" id="venue-name">
            {CONFIG.venueName}
          </h2>
          <p className="location__address" id="venue-address">
            {CONFIG.venueAddress}
          </p>
          <iframe
            className="map-frame"
            id="map-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="خريطة مكان الحفل"
            src={mapFrameSrc}
          />
          <br />
          <a className="directions-btn" id="directions-link" href={directionsHref} target="_blank" rel="noopener">
            احصل على الاتجاهات
          </a>
        </section>

        {/* ============ Dress code ============ */}
        <section className="dress section wrap reveal" id="dress-section">
          <p className="dress__lead">يسعدنا رؤيتكم بهذه الألوان</p>
          <div className="dress__swatches" id="dress-swatches">
            {CONFIG.dressColors.map((c, i) => (
              <span key={i} className="dress__swatch" style={{ background: c }}></span>
            ))}
          </div>
        </section>

        {/* ============ RSVP ============ */}
        <section className="rsvp section wrap reveal" id="rsvp-section">
          <p className="section__eyebrow" style={{ textAlign: "center" }}>
            تأكيد الحضور
          </p>
          <div className="rule">
            <span>✦</span>
          </div>
          <form className="rsvp__form" id="rsvp-form" onSubmit={handleRSVPSubmit}>
            <div className="field">
              <label htmlFor="rsvp-name">الاسم بالكامل</label>
              <input type="text" id="rsvp-name" name="name" required placeholder="اكتب اسمك هنا" />
            </div>
            <div className="field">
              <label>هل ستحضرون معنا الاحتفال؟</label>
              <div className="radio-row">
                <label className="radio-opt">
                  <input type="radio" name="attending" value="yes" required /> بكل سرور، حاضرين 🤍
                </label>
                <label className="radio-opt">
                  <input type="radio" name="attending" value="no" /> للأسف، مش هنقدر نحضر
                </label>
              </div>
            </div>
            <div className="field">
              <label htmlFor="rsvp-guests">عدد الأشخاص الحاضرين</label>
              <input type="number" id="rsvp-guests" name="guests" min={1} max={10} defaultValue={1} />
            </div>
            <div className="field">
              <label htmlFor="rsvp-message">رسالة للعروسين (اختياري)</label>
              <textarea id="rsvp-message" name="message" placeholder="اكتب أمنياتك ليهم..."></textarea>
            </div>
            <button type="submit" className="seal-btn">
              ختم التأكيد ✦
            </button>
          </form>
        </section>

        {/* ============ Footer ============ */}
        <footer className="footer wrap reveal">
          <div className="rule">
            <span>✦</span>
          </div>
          <p className="footer__line">في انتظار حضوركم بشوق 🤍</p>
          <p className="footer__names" id="footer-names">
            {CONFIG.groomNameAr} &amp; {CONFIG.brideNameAr}
          </p>
        </footer>
      </main>
    </>
  );
}
