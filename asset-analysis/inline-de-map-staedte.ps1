$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Src = Join-Path $Root 'Bildmaterial_final\icons\germany-admin-map_Staedte.svg'
$Targets = @(
  (Join-Path $Root 'index.html'),
  (Join-Path $Root 'unternehmen\index.html'),
  (Join-Path $Root 'kontakt\index.html')
)

$CITY_META = @{
  Karlsruhe    = 'Ettlingen'
  Tuttlingen   = 'Stockach'
  Oberasbach   = 'Oberasbach'
  Eching       = 'Eching'
  Niederhausen = 'Niedernhausen'
  Leichlingen  = 'Leichlingen'
  Winsen       = 'Winsen (Luhe)'
  Berlin       = 'Berlin'
}

$MAP_DEFS = @'
<defs>
    <linearGradient id="de-map-land-gradient" x1="72" y1="48" x2="420" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d4ebff"/>
      <stop offset="38%" stop-color="#9fd0ff"/>
      <stop offset="72%" stop-color="#6eb5f2"/>
      <stop offset="100%" stop-color="#3d8fd9"/>
    </linearGradient>
    <linearGradient id="de-map-city-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4ec4ff"/>
      <stop offset="55%" stop-color="#0194e8"/>
      <stop offset="100%" stop-color="#0154a8"/>
    </linearGradient>
    <filter id="de-map-land-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#0161bf" flood-opacity="0.18"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#073975" flood-opacity="0.12"/>
    </filter>
    <filter id="de-map-city-glow" x="-120%" y="-120%" width="340%" height="340%">
      <feDropShadow dx="0" dy="3" stdDeviation="4.5" flood-color="#0161bf" flood-opacity="0.36"/>
    </filter>
  </defs>
'@

function Build-InlineSvg {
  $svg = [IO.File]::ReadAllText($Src)
  $svg = [regex]::Replace($svg, '(?s)^<\?xml[^?]*\?>\s*', '')
  $svg = [regex]::Replace($svg, '(?s)<!--.*?-->\s*', '')
  $svg = [regex]::Replace($svg, '(?s)<style>.*?</style>\s*', '')
  $viewBox = '0 0 485.09 679.64'
  if ($svg -match 'viewBox="([^"]+)"') { $viewBox = $Matches[1] }
  $openTag = '<svg xmlns="http://www.w3.org/2000/svg" class="de-map__svg" viewBox="' + $viewBox + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Deutschlandkarte - Igienair Standorte">'
  $svg = [regex]::Replace($svg, '(?s)^<svg[^>]*>', $openTag)
  $svg = [regex]::Replace($svg, '(?s)<defs>.*?</defs>\s*', '')
  $svg = [regex]::Replace($svg, '(?s)^(<svg[^>]*>)', ('$1' + "`n  " + $MAP_DEFS + "`n"))
  $svg = [regex]::Replace($svg, '(?s)<rect[^>]*/>\s*', '')

  if ($svg -match 'class="cls-3"') {
    $svg = $svg -replace '<path class="cls-3"', '<path class="de-map__bg"'
    $svg = [regex]::Replace($svg, '(?s)((?:<path class="de-map__bg"[\s\S]*?/>)+)', '<g class="de-map__land-shape">$1</g>')
  } else {
    $svg = [regex]::Replace($svg, '(?s)<g>\s*((?:<path[\s\S]*?/>[\s]*)+)</g>', {
      param($m)
      $paths = $m.Groups[1].Value -replace '<path(?=\s)', '<path class="de-map__bg"'
      return ('<g class="de-map__land-shape">' + "`n    " + $paths.Trim() + "`n  </g>")
    })
  }

  foreach ($id in $CITY_META.Keys) {
    $label = $CITY_META[$id]
    $legacy = '(?s)<circle\s+id="' + [regex]::Escape($id) + '"\s+class="cls-\d+"\s+cx="([^"]+)"\s+cy="([^"]+)"\s+r="([^"]+)"\s*/>'
    $modern = '(?s)<circle\s+id="' + [regex]::Escape($id) + '"[^>]*\bcx="([^"]+)"[^>]*\bcy="([^"]+)"[^>]*\br="([^"]+)"[^>]*/>'
    $replacement = '<circle class="de-map__land de-map__city" id="' + $id + '" data-label="' + $label + '" cx="$1" cy="$2" r="$3" aria-label="' + $label + '"><title>' + $label + '</title></circle>'
    if ($svg -match $legacy) {
      $svg = [regex]::Replace($svg, $legacy, $replacement)
    } elseif ($svg -match $modern) {
      $svg = [regex]::Replace($svg, $modern, $replacement)
    }
  }

  return $svg.Trim()
}

function Build-MapBlock([string]$InlineSvg, [string]$Indent) {
  $lines = @(
    ($Indent + '<div class="de-map" data-presence-map data-presence-map-mode="staedte">')
    ($Indent + '  <div class="de-map__stage de-map__stage--staedte">')
    ($Indent + '    <div class="de-map__svg-host" data-presence-map-svg>' + $InlineSvg + '</div>')
    ($Indent + '    <span class="de-map__tooltip" data-presence-map-tooltip role="status" aria-live="polite"></span>')
  )
  return ($lines -join "`n")
}

$inlineSvg = Build-InlineSvg
$blockRegex = '(?s)<div class="de-map" data-presence-map(?: data-presence-map-mode="[^"]*")?>.*?</span>'

foreach ($target in $Targets) {
  if (-not (Test-Path $target)) {
    Write-Warning ('Uebersprungen: ' + $target)
    continue
  }
  $html = [IO.File]::ReadAllText($target)
  if ($html -notmatch $blockRegex) {
    Write-Warning ('Kein Karten-Block: ' + $target)
    continue
  }
  $html = [regex]::Replace($html, $blockRegex, (Build-MapBlock $inlineSvg '            '))
  [IO.File]::WriteAllText($target, $html, [Text.UTF8Encoding]::new($false))
  Write-Host ('Staedte-Karte eingebettet: ' + $target)
}

Write-Host ('Fertig (' + $inlineSvg.Length + ' Zeichen SVG).')
