$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','.git','node_modules','Bildmaterial_final')

$spanPattern = '(anlagen/kuehlturmreinigung/index\.html"><span>)K&uuml;hlturmreinigung(</span>)'
$linkPattern = '(anlagen/kuehlturmreinigung/index\.html">)K&uuml;hlturmreinigung(</a>)'
$replacementSpan = '${1}K&uuml;hlturmreinigung 42. BImSchV${2}'
$replacementLink = '${1}K&uuml;hlturmreinigung 42. BImSchV${2}'

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

function Update-Html([string]$html) {
  $updated = [regex]::Replace($html, $spanPattern, $replacementSpan)
  $updated = [regex]::Replace($updated, $linkPattern, $replacementLink)
  return $updated
}

$changed = 0
Get-ChildItem -Path $Root -Recurse -Filter '*.html' -File | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
  if (Test-Excluded $rel) { return }
  $original = [IO.File]::ReadAllText($_.FullName)
  $updated = Update-Html $original
  if ($updated -ne $original) {
    [IO.File]::WriteAllText($_.FullName, $updated, [Text.UTF8Encoding]::new($false))
    $changed++
  }
}

$themeHeader = Join-Path $Root 'leadwerk_theme/partials/site-header.html'
if (Test-Path $themeHeader) {
  $original = [IO.File]::ReadAllText($themeHeader)
  $updated = Update-Html $original
  if ($updated -ne $original) {
    [IO.File]::WriteAllText($themeHeader, $updated, [Text.UTF8Encoding]::new($false))
    $changed++
  }
}

Write-Host "Aktualisiert: $changed Dateien"
