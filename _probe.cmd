@echo off
echo === PAGES 1 ===
gh api /repos/theTBeck/DoPSite-films-1/pages --jq .status
echo === PAGES 2 ===
gh api /repos/theTBeck/DoPSite-films-2/pages --jq .status
echo === SITE JS ===
curl.exe -sI "https://thetbeck.github.io/DoPSite_Reel/js/film-hosts.js?v=ghfilms"
echo === FILM 2 ===
curl.exe -sI "https://thetbeck.github.io/DoPSite-films-2/AdidasPharrel.mp4"
echo === FILM 1 ===
curl.exe -sI "https://thetbeck.github.io/DoPSite-films-1/Hidro.mp4"
echo PROBE_DONE
