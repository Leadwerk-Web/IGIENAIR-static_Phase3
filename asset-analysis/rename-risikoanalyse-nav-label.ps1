$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','.playwright-mcp','node_modules','.git','Bildmaterial_final','assets')

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

$spanPattern = '(gefaehrdungsbeurteilung-vdi-2047/index\.html"><span>)Gef&auml;hrdungsbeurteilung VDI 2047-2(</span>)'
$linkPattern = '(gefaehrdungsbeurteilung-vdi-2047/index\.html">)Gef&auml;hrdungsbeurteilung VDI 2047-2(</a>)'

$changed = 0
Get-ChildItem -Path $Root -Recurse -Filter '*.html' -File | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
  if (Test-Excluded $rel) { return }
  $original = [IO.File]::ReadAllText($_.FullName)
  $updated = [regex]::Replace($original, $spanPattern, '${1}Risikoanalyse VDI 2047-2${2}')
  $updated = [regex]::Replace($updated, $linkPattern, '${1}Risikoanalyse VDI 2047-2${2}')
  if ($updated -ne $original) {
    [IO.File]::WriteAllText($_.FullName, $updated, [Text.UTF8Encoding]::new($false))
    $changed++
  }
}

# leadwerk_theme (ausgeschlossen vom Hauptlauf)
$themeHeader = Join-Path $Root 'leadwerk_theme/partials/site-header.html'
if (Test-Path $themeHeader) {
  $original = [IO.File]::ReadAllText($themeHeader)
  $updated = [regex]::Replace($original, $spanPattern, '${1}Risikoanalyse VDI 2047-2${2}')
  $updated = [regex]::Replace($updated, $linkPattern, '${1}Risikoanalyse VDI 2047-2${2}')
  if ($updated -ne $original) {
    [IO.File]::WriteAllText($themeHeader, $updated, [Text.UTF8Encoding]::new($false))
    $changed++
  }
}

Write-Host "Aktualisiert: $changed Dateien"
