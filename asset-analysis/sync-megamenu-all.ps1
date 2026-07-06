$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot

Write-Host '== Leistungen-Navigation ==' -ForegroundColor Cyan
& (Join-Path $here 'rebuild-leistungen-nav-full.ps1')

Write-Host '== Kunden-Navigation ==' -ForegroundColor Cyan
& (Join-Path $here 'rebuild-kunden-nav.ps1')

Write-Host '== Leistungscluster-Ueberblick ==' -ForegroundColor Cyan
& (Join-Path $here 'rebuild-leistungen-cluster-overview.ps1')

Write-Host 'Fertig: Mega-Menue, Kunden-Nav und Leistungscluster synchronisiert.' -ForegroundColor Green
