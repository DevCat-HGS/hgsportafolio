import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT_API } from "../lib/endpoints";
import type { Copy } from "../content";

type Status = "idle" | "sending" | "sent" | "error";

declare global {
  interface Window {
    umami?: { track: (event: string) => void };
  }
}

/**
 * Posts to the admin's contact function (admin/netlify/functions/contact.mts), which stores the message, emails it
 * to me and sends the visitor a confirmation in the page's language. `website` is a honeypot people never see, and
 * `elapsed` tells the function how long the form took to fill (bots are instant).
 */
export function ContactForm({ t }: { t: Copy }) {
  const [status, setStatus] = useState<Status>("idle");
  const opened = useRef(0);
  useEffect(() => {
    opened.current = Date.now();
  }, []);
  const f = t.contactForm;
  const lang = t.langLabel === "EN" ? "es" : "en";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, lang, elapsed: Date.now() - opened.current }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("sent");
      window.umami?.track("contact-sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="contact" name="contact" onSubmit={onSubmit}>
      <h3 className="contact-title">{f.title}</h3>
      <p className="contact-hp" aria-hidden="true">
        <label>
          Web <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="contact-row">
        <label>
          <span>{f.name}</span>
          <input name="name" type="text" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          <span>{f.email}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={200} />
        </label>
      </div>
      <label>
        <span>{f.message}</span>
        <textarea name="message" rows={5} required maxLength={4000} />
      </label>
      <div className="contact-foot">
        <button type="submit" className="social-btn primary" disabled={status === "sending"} data-umami-event="contact">
          {status === "sending" ? f.sending : f.submit}
        </button>
        <p className="contact-status" role="status" aria-live="polite">
          {status === "sent" ? f.sent : status === "error" ? f.error : ""}
        </p>
      </div>
    </form>
  );
}
