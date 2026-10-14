@echo off
echo === FILM 2 ===
curl.exe -sI -H "Range: bytes=0-1" "https://thetbeck.github.io/DoPSite-films-2/AdidasPharrel.mp4"
echo === FILM 1 ===
curl.exe -sI -H "Range: bytes=0-1" "https://thetbeck.github.io/DoPSite-films-1/Hidro.mp4"
echo === INDEX ===
curl.exe -sI "https://thetbeck.github.io/DoPSite_Reel/index.html"
echo PROBE2_DONE
