import os
root = r"C:\inteligencia-artificial\DoPSite-RV"
names = [
    "reel_v1_capcut_ritchie_1080p.mp4",
    "HistoriaDavi-doc.mp4",
    "Amazon-Rally.mp4",
    "NikeFootbal.mp4",
    "Exilados-doc.mp4",
    "Exilio.mp4",
    "Hondad-Reality01.mp4",
    "Honda-Reality02.mp4",
    "Honda-Reality03.mp4",
    "SteveSpigel-curtasequenciq.mp4",
    "Coletanea.mp4",
    "Curta-desaparecido.mp4",
    "AdidasPharrel.mp4",
    "AlphaRomeu.mp4",
    "Bancodobrasil.mp4",
    "Buscopam.mp4",
    "Cannon-Amor.mp4",
    "Cupnoodles.mp4",
    "Epson-canudos.mp4",
    "Granola.mp4",
    "Hidro.mp4",
    "Indaia.mp4",
    "Jeep-RENEGADE.mp4",
    "JeepGladiator.mp4",
    "Marisa.mp4",
    "Ora3GWM.mp4",
    "Rico Joao.mp4",
    "Serasa-detetive.mp4",
    "Sonic-TELECINE.mp4",
    "SonyBRAVIA.mp4",
    "TataExa.mp4",
    "Tim-Genius.mp4",
    "Zaxy.mp4",
]
lim = 100 * 1024 * 1024
rows = []
for n in names:
    p = os.path.join(root, n)
    ok = os.path.isfile(p)
    sz = os.path.getsize(p) if ok else -1
    rows.append((sz, n, ok))
    flag = "MISSING" if not ok else ("OVER" if sz >= lim else "ok")
    print(f"{sz/1048576:8.1f} MB  {flag:7}  {n}")
tot = sum(sz for sz, _, ok in rows if ok)
print("TOTAL_MB", round(tot / 1048576, 1))
print("COUNT", sum(1 for _, _, ok in rows if ok))
print("OVER", sum(1 for sz, _, ok in rows if ok and sz >= lim))
