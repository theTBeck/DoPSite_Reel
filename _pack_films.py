import os
import sys

root = r"C:\inteligencia-artificial\DoPSite-RV"
out = r"C:\inteligencia-artificial\DoPSite-RV\_film_pack.txt"
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
cap = 820 * 1024 * 1024
rows = []
lines = []
for n in names:
    p = os.path.join(root, n)
    if not os.path.isfile(p):
        lines.append("MISSING " + n)
        continue
    sz = os.path.getsize(p)
    flag = "OVER" if sz >= lim else "ok"
    lines.append(f"{sz} {flag} {n}")
    if sz < lim:
        rows.append((sz, n, p))
rows.sort(reverse=True)
bins = []
for sz, n, p in rows:
    placed = False
    for b in bins:
        if b[0] + sz <= cap:
            b[0] += sz
            b[1].append((n, p, sz))
            placed = True
            break
    if not placed:
        bins.append([sz, [(n, p, sz)]])
lines.append(f"BINS {len(bins)}")
for i, b in enumerate(bins, 1):
    lines.append(f"BIN {i} BYTES {b[0]}")
    for n, p, sz in b[1]:
        lines.append(f"  {n}")
text = "\n".join(lines) + "\n"
with open(out, "w", encoding="utf-8") as f:
    f.write(text)
print(text)
sys.stdout.flush()
