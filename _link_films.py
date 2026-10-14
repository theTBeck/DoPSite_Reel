import os

src = r"C:\inteligencia-artificial\DoPSite-RV"
groups = {
    r"C:\inteligencia-artificial\DoPSite-films-1": [
        "reel_v1_capcut_ritchie_1080p.mp4",
        "Exilados-doc.mp4",
        "Hondad-Reality01.mp4",
        "NikeFootbal.mp4",
        "Honda-Reality03.mp4",
        "SteveSpigel-curtasequenciq.mp4",
        "JeepGladiator.mp4",
        "Curta-desaparecido.mp4",
        "HistoriaDavi-doc.mp4",
        "Hidro.mp4",
    ],
    r"C:\inteligencia-artificial\DoPSite-films-2": [
        "Honda-Reality02.mp4",
        "Amazon-Rally.mp4",
        "Coletanea.mp4",
        "Exilio.mp4",
        "Jeep-RENEGADE.mp4",
        "Marisa.mp4",
        "Cannon-Amor.mp4",
        "TataExa.mp4",
        "Sonic-TELECINE.mp4",
        "Zaxy.mp4",
        "Serasa-detetive.mp4",
        "Tim-Genius.mp4",
        "SonyBRAVIA.mp4",
        "Bancodobrasil.mp4",
        "Indaia.mp4",
        "AlphaRomeu.mp4",
        "Ora3GWM.mp4",
        "Epson-canudos.mp4",
        "Granola.mp4",
        "Buscopam.mp4",
        "Rico Joao.mp4",
        "Cupnoodles.mp4",
        "AdidasPharrel.mp4",
    ],
}
log = []
for dest, names in groups.items():
    for n in names:
        a = os.path.join(src, n)
        b = os.path.join(dest, n)
        if os.path.exists(b):
            log.append("exists " + b)
            continue
        os.link(a, b)
        log.append("linked " + n + " -> " + dest)
text = "\n".join(log) + "\n"
path = r"C:\inteligencia-artificial\DoPSite-RV\_link_films.txt"
with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("LINK_OK", len(log))
