@echo off
set GIT_TERMINAL_PROMPT=0
cd /d C:\inteligencia-artificial\DoPSite-films-2
git add -- .nojekyll
if errorlevel 1 goto fail
git add -- "Honda-Reality02.mp4"
if errorlevel 1 goto fail
git add -- "Amazon-Rally.mp4"
if errorlevel 1 goto fail
git add -- "Coletanea.mp4"
if errorlevel 1 goto fail
git add -- "Exilio.mp4"
if errorlevel 1 goto fail
git add -- "Jeep-RENEGADE.mp4"
if errorlevel 1 goto fail
git add -- "Marisa.mp4"
if errorlevel 1 goto fail
git add -- "Cannon-Amor.mp4"
if errorlevel 1 goto fail
git add -- "TataExa.mp4"
if errorlevel 1 goto fail
git add -- "Sonic-TELECINE.mp4"
if errorlevel 1 goto fail
git add -- "Zaxy.mp4"
if errorlevel 1 goto fail
git add -- "Serasa-detetive.mp4"
if errorlevel 1 goto fail
git add -- "Tim-Genius.mp4"
if errorlevel 1 goto fail
git add -- "SonyBRAVIA.mp4"
if errorlevel 1 goto fail
git add -- "Bancodobrasil.mp4"
if errorlevel 1 goto fail
git add -- "Indaia.mp4"
if errorlevel 1 goto fail
git add -- "AlphaRomeu.mp4"
if errorlevel 1 goto fail
git add -- "Ora3GWM.mp4"
if errorlevel 1 goto fail
git add -- "Epson-canudos.mp4"
if errorlevel 1 goto fail
git add -- "Granola.mp4"
if errorlevel 1 goto fail
git add -- "Buscopam.mp4"
if errorlevel 1 goto fail
git add -- "Rico Joao.mp4"
if errorlevel 1 goto fail
git add -- "Cupnoodles.mp4"
if errorlevel 1 goto fail
git add -- "AdidasPharrel.mp4"
if errorlevel 1 goto fail
git commit -m "Publish the second DoP film set for GitHub Pages."
if errorlevel 1 goto fail
git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push origin HEAD
if errorlevel 1 goto fail
echo PUSH2_OK
exit /b 0
:fail
echo PUSH2_FAIL
exit /b 1
