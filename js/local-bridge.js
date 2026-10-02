/* Ponte: o site no GitHub usa os MP4 desta máquina quando o servidor local responde. */

const CANDIDATES = ["https://127.0.0.1:4174", "https://localhost:4174"];

export async function detectLocalOrigin(timeoutMs = 1500) {
  for (const origin of CANDIDATES) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(origin + "/bridge.json", {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        signal: ctrl.signal,
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.ok) return origin;
    } catch (_) {
      /* servidor local fechado, certificado recusado, ou rede local bloqueada */
    } finally {
      clearTimeout(timer);
    }
  }
  return "";
}

export function toLocal(origin, href) {
  if (!origin || !href) return href;
  if (/^https?:/i.test(href)) return href;
  return origin + "/" + String(href).replace(/^\.?\//, "");
}
