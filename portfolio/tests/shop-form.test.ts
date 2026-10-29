import { describe, expect, it } from "vitest";
import { CONTACT_LIMITS, type ContactDeps } from "../../admin/netlify/lib/contact";
import {
  allowedShopOrigin,
  parseShopSubmission,
  receiveShopForm,
  shopConfirmation,
  shopNotification,
  type ShopSubmission,
} from "../../admin/netlify/lib/shopForm";

const cfg = {
  to: "me@example.com",
  from: "HGS Digital <contacto@hgsportafolio.site>",
  site: "https://products.hgsportafolio.site",
};
const quote: ShopSubmission = {
  kind: "cotizacion",
  name: "Ana Pérez",
  email: "ana@empresa.com",
  message: "Necesitamos un panel <script>x</script>\npara pedidos",
  fields: [
    ["Empresa o proyecto", "Ferretería Norte"],
    ["Presupuesto orientativo", "500 – 2.000 USD"],
  ],
};

describe("HGS Digital forms", () => {
  it("accepts a quote with labelled fields and drops empty or oversized ones", () => {
    const parsed = parseShopSubmission({
      kind: "cotizacion",
      name: " Ana ",
      email: "ana@empresa.com",
      message: "Un panel",
      fields: [["Empresa", "Norte"], ["Vacío", ""], ["x".repeat(80), "y".repeat(400)], "no es un par"],
    });
    expect(parsed?.name).toBe("Ana");
    expect(parsed?.fields).toEqual([
      ["Empresa", "Norte"],
      ["x".repeat(60), "y".repeat(300)],
    ]);
  });

  it("rejects an unknown form, a bad email or a missing message", () => {
    const ok = { kind: "contacto", name: "Luis", email: "luis@correo.com", message: "Hola" };
    expect(parseShopSubmission(ok)?.kind).toBe("contacto");
    expect(parseShopSubmission({ ...ok, kind: "otro" })).toBeNull();
    expect(parseShopSubmission({ ...ok, email: "luis" })).toBeNull();
    expect(parseShopSubmission({ ...ok, message: " " })).toBeNull();
    expect(parseShopSubmission({ ...ok, "bot-field": "x" })).toBeNull();
  });

  it("sends me every field escaped, replying to the visitor", () => {
    const e = shopNotification(quote, cfg, new Date("2026-10-29T15:00:00Z"));
    expect(e.to).toEqual(["me@example.com"]);
    expect(e.reply_to).toBe("ana@empresa.com");
    expect(e.subject).toBe("Nueva cotización de Ana Pérez desde HGS Digital");
    expect(e.html).toContain("Ferretería Norte");
    expect(e.html).toContain("&lt;script&gt;");
    expect(e.html).not.toContain("<script>");
    expect(e.text).toContain("Presupuesto orientativo: 500 – 2.000 USD");
  });

  it("confirms to the visitor without repeating what they wrote", () => {
    const e = shopConfirmation({ ...quote, name: "Ana <a href=x>", fields: [["Empresa", "Texto arbitrario"]] }, cfg);
    expect(e.to).toEqual(["ana@empresa.com"]);
    expect(e.subject).toBe("Recibí tu solicitud de cotización");
    expect(e.html).not.toContain("Texto arbitrario");
    expect(e.html).not.toContain("panel");
    expect(e.html).toContain("Hola, Ana:");
    expect(shopConfirmation({ ...quote, kind: "contacto" }, cfg).subject).toBe("Recibí tu mensaje");
  });

  it("only accepts posts from HGS Digital and its previews", () => {
    expect(allowedShopOrigin("https://products.hgsportafolio.site")).toBe(true);
    expect(allowedShopOrigin("https://shop-hgs.netlify.app")).toBe(true);
    expect(allowedShopOrigin("https://deploy-preview-74--shop-hgs.netlify.app")).toBe(true);
    expect(allowedShopOrigin("https://hgsportafolio.site")).toBe(false);
    expect(allowedShopOrigin("https://x--shop-hgs.netlify.app.evil.example")).toBe(false);
    expect(allowedShopOrigin(null)).toBe(false);
  });

  describe("receiving", () => {
    const setup = () => {
      const store = new Map<string, string>();
      const sent: { to: string[]; subject: string }[] = [];
      let clock = Date.parse("2026-10-29T15:00:00Z");
      const deps = (ip = "203.0.113.7"): ContactDeps => ({
        store: { get: async (k) => store.get(k) ?? null, set: async (k, v) => void store.set(k, v) },
        send: async (e) => void sent.push({ to: e.to, subject: e.subject }),
        env: (k) => ({ ADMIN_EMAIL: "owner@example.com" })[k as "ADMIN_EMAIL"],
        now: () => clock,
        ip,
      });
      return { store, sent, deps, tick: (ms: number) => (clock += ms) };
    };
    const body = { ...quote, elapsed: 9000 };

    it("stores the message with its origin and sends both emails", async () => {
      const t = setup();
      expect(await receiveShopForm(t.deps(), body)).toEqual({ status: 200, body: { ok: true } });
      expect(t.sent.map((s) => s.to[0])).toEqual(["owner@example.com", "ana@empresa.com"]);
      const stored = [...t.store.entries()].find(([k]) => k.startsWith("msg:"));
      expect(JSON.parse(stored![1])).toMatchObject({ source: "shop", kind: "cotizacion", fields: quote.fields });
    });

    it("silently drops bots and rejects invalid submissions", async () => {
      const t = setup();
      expect((await receiveShopForm(t.deps(), { ...body, "bot-field": "x" })).status).toBe(200);
      expect((await receiveShopForm(t.deps(), { ...body, elapsed: 400 })).status).toBe(200);
      expect(t.sent).toHaveLength(0);
      expect((await receiveShopForm(t.deps(), { ...body, email: "nope" })).status).toBe(400);
    });

    it("shares the per-address limit with the portfolio form", async () => {
      const t = setup();
      for (let i = 0; i < CONTACT_LIMITS.perIp; i++) await receiveShopForm(t.deps(), { ...body, message: `m${i}` });
      expect((await receiveShopForm(t.deps(), body)).status).toBe(429);
      t.tick(CONTACT_LIMITS.ipWindowMs + 1);
      expect((await receiveShopForm(t.deps(), body)).status).toBe(200);
    });
  });
});
