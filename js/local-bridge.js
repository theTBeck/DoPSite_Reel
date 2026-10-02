/* Ponte: o site no GitHub usa os MP4 desta máquina quando o servidor local responde. */

const CANDIDATES = ["https://127.0.0.1:4174", "https://localhost:4174"];

export async function detectLocalOrigin(timeoutMs = 8000) {
  const attempts = CANDIDATES.map(async (origin) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(origin + "/bridge.json", {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        signal: ctrl.signal,
      });
      if (!res.ok) return "";
      const data = await res.json();
      return data && data.ok ? origin : "";
    } catch (_) {
      return "";
    } finally {
      clearTimeout(timer);
    }
  });
  const found = (await Promise.all(attempts)).find(Boolean);
  return found || "";
}

export function toLocal(origin, href) {
  if (!origin || !href) return href;
  if (/^https?:/i.test(href)) return href;
  return origin + "/" + String(href).replace(/^\.?\//, "");
}
