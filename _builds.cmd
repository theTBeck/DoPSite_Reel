@echo off
ping -n 75 127.0.0.1 >nul
echo === BUILDS 1 ===
gh api /repos/theTBeck/DoPSite-films-1/pages/builds --jq ".[0] | {status, error, created_at, duration}"
echo === BUILDS 2 ===
gh api /repos/theTBeck/DoPSite-films-2/pages/builds --jq ".[0] | {status, error, created_at, duration}"
echo BUILD_DONE
