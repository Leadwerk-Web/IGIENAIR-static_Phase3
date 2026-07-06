$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','.git','node_modules','Bildmaterial_final')

$Replacements = @(
  @{
    Span = '(anlagen/lueftungsreinigung/index\.html"><span>)L&uuml;ftungsreinigung(</span>)'
    Link = '(anlagen/lueftungsreinigung/index\.html">)L&uuml;ftungsreinigung(</a>)'
    New  = '${1}L&uuml;ftungsreinigung VDI 6022${2}'
  }
  @{
    Span = '(anlagen/luftkanalreinigung/index\.html"><span>)Luftkanalreinigung(</span>)'
    Link = '(anlagen/luftkanalreinigung/index\.html">)Luftkanalreinigung(</a>)'
    New  = '${1}Luftkanalreinigung VDI 6022${2}'
  }
  @{
    Span = '(anlagen/lueftungsanlagenreinigung/index\.html"><span>)RLT-Anlagenreinigung(</span>)'
    Link = '(anlagen/lueftungsanlagenreinigung/index\.html">)RLT-Anlagenreinigung(</a>)'
    New  = '${1}RLT-Anlagenreinigung VDI 6022${2}'
  }
)

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

function Update-Html([string]$html) {
  foreach ($r in $Replacements) {
    $html = [regex]::Replace($html, $r.Span, $r.New)
    $html = [regex]::Replace($html, $r.Link, $r.New)
  }
  return $html
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
