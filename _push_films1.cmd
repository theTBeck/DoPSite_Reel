@echo off
set GIT_TERMINAL_PROMPT=0
cd /d C:\inteligencia-artificial\DoPSite-films-1
git add -- .nojekyll
if errorlevel 1 goto fail
git add -- "reel_v1_capcut_ritchie_1080p.mp4"
if errorlevel 1 goto fail
git add -- "Exilados-doc.mp4"
if errorlevel 1 goto fail
git add -- "Hondad-Reality01.mp4"
if errorlevel 1 goto fail
git add -- "NikeFootbal.mp4"
if errorlevel 1 goto fail
git add -- "Honda-Reality03.mp4"
if errorlevel 1 goto fail
git add -- "SteveSpigel-curtasequenciq.mp4"
if errorlevel 1 goto fail
git add -- "JeepGladiator.mp4"
if errorlevel 1 goto fail
git add -- "Curta-desaparecido.mp4"
if errorlevel 1 goto fail
git add -- "HistoriaDavi-doc.mp4"
if errorlevel 1 goto fail
git add -- "Hidro.mp4"
if errorlevel 1 goto fail
git commit -m "Publish the first DoP film set for GitHub Pages."
if errorlevel 1 goto fail
git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push origin HEAD
if errorlevel 1 goto fail
echo PUSH1_OK
exit /b 0
:fail
echo PUSH1_FAIL
exit /b 1
