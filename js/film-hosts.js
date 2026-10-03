const A = "https://thetbeck.github.io/DoPSite-films-1/";
const B = "https://thetbeck.github.io/DoPSite-films-2/";

export const FILM_URL = {
  "reel_v1_capcut_ritchie_1080p.mp4": A + "reel_v1_capcut_ritchie_1080p.mp4",
  "Exilados-doc.mp4": A + "Exilados-doc.mp4",
  "Hondad-Reality01.mp4": A + "Hondad-Reality01.mp4",
  "NikeFootbal.mp4": A + "NikeFootbal.mp4",
  "Honda-Reality03.mp4": A + "Honda-Reality03.mp4",
  "SteveSpigel-curtasequenciq.mp4": A + "SteveSpigel-curtasequenciq.mp4",
  "JeepGladiator.mp4": A + "JeepGladiator.mp4",
  "Curta-desaparecido.mp4": A + "Curta-desaparecido.mp4",
  "HistoriaDavi-doc.mp4": A + "HistoriaDavi-doc.mp4",
  "Hidro.mp4": A + "Hidro.mp4",
  "Honda-Reality02.mp4": B + "Honda-Reality02.mp4",
  "Amazon-Rally.mp4": B + "Amazon-Rally.mp4",
  "Coletanea.mp4": B + "Coletanea.mp4",
  "Exilio.mp4": B + "Exilio.mp4",
  "Jeep-RENEGADE.mp4": B + "Jeep-RENEGADE.mp4",
  "Marisa.mp4": B + "Marisa.mp4",
  "Cannon-Amor.mp4": B + "Cannon-Amor.mp4",
  "TataExa.mp4": B + "TataExa.mp4",
  "Sonic-TELECINE.mp4": B + "Sonic-TELECINE.mp4",
  "Zaxy.mp4": B + "Zaxy.mp4",
  "Serasa-detetive.mp4": B + "Serasa-detetive.mp4",
  "Tim-Genius.mp4": B + "Tim-Genius.mp4",
  "SonyBRAVIA.mp4": B + "SonyBRAVIA.mp4",
  "Bancodobrasil.mp4": B + "Bancodobrasil.mp4",
  "Indaia.mp4": B + "Indaia.mp4",
  "AlphaRomeu.mp4": B + "AlphaRomeu.mp4",
  "Ora3GWM.mp4": B + "Ora3GWM.mp4",
  "Epson-canudos.mp4": B + "Epson-canudos.mp4",
  "Granola.mp4": B + "Granola.mp4",
  "Buscopam.mp4": B + "Buscopam.mp4",
  "Rico Joao.mp4": B + "Rico%20Joao.mp4",
  "Cupnoodles.mp4": B + "Cupnoodles.mp4",
  "AdidasPharrel.mp4": B + "AdidasPharrel.mp4",
};

export function filmUrl(href) {
  if (!href) return "";
  let name = String(href).split("?")[0].split("/").pop();
  try { name = decodeURIComponent(name); } catch (_) {}
  return FILM_URL[name] || "";
}
