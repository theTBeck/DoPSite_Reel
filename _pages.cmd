@echo off
set GIT_TERMINAL_PROMPT=0
gh api --method POST /repos/theTBeck/DoPSite-films-1/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
echo EXIT1 %ERRORLEVEL%
gh api --method POST /repos/theTBeck/DoPSite-films-2/pages -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"
echo EXIT2 %ERRORLEVEL%
echo PAGES_DONE
