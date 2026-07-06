$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','leadwerk-fields','leadwerk-wpml-clone','.playwright-mcp','node_modules','.git','docs','Bildmaterial_final','assets')

$Clusters = @(
  @{ Title = 'Branchenl&ouml;sungen'; Links = @(
      ,@('branchen/index.html','Branchen &amp; &Uuml;bersicht')
      ,@('kunden/gesundheit/index.html','Gesundheitswesen')
      ,@('kunden/pharma/index.html','Pharma')
      ,@('kunden/lebensmittel/index.html','Lebensmittel')
      ,@('industrie/index.html','Industrie')
      ,@('kunden/gastronomie/index.html','Gastronomie')
      ,@('kunden/gemeinden/index.html','Kommunen &amp; Gemeinden')
    ) }
  @{ Title = 'Referenzen S&uuml;d &amp; West'; Links = @(
      ,@('kunden/referenzen/baden-wuerttemberg/index.html','Baden-W&uuml;rttemberg')
      ,@('kunden/referenzen/bayern/index.html','Bayern')
      ,@('kunden/referenzen/hessen/index.html','Hessen')
      ,@('kunden/referenzen/rheinland-pfalz/index.html','Rheinland-Pfalz')
      ,@('kunden/referenzen/saarland/index.html','Saarland')
      ,@('kunden/referenzen/region-bodensee/index.html','Region Bodensee')
    ) }
  @{ Title = 'Referenzen Nord &amp; Ost'; Links = @(
      ,@('kunden/referenzen/nrw/index.html','Nordrhein-Westfalen')
      ,@('kunden/referenzen/hamburg/index.html','Gro&szlig;raum Hamburg')
      ,@('kunden/referenzen/berlin/index.html','Gro&szlig;raum Berlin')
      ,@('kunden/referenzen/index.html','Alle Referenzen')
    ) }
)

function Get-Prefix([int]$depth) {
  if ($depth -eq 0) { return './' }
  return ('../' * $depth)
}

function Test-KundenSection([string]$rel) {
  return $rel.StartsWith('kunden/') -or $rel.StartsWith('branchen/') -or $rel -eq 'industrie/index.html'
}

function Build-Desktop([string]$prefix, [bool]$current) {
  $cur = if ($current) { ' aria-current="page"' } else { '' }
  $clusterBlocks = foreach ($c in $Clusters) {
    $linkLines = foreach ($pair in $c.Links) {
      $href = $pair[0]
      $label = $pair[1]
      '              <a class="nav-link" href="{0}{1}"><span>{2}</span></a>' -f $prefix, $href, $label
    }
    $links = $linkLines -join "`n"
    "            <div class=`"nav-cluster`">`n              <p class=`"nav-cluster__title`">$($c.Title)</p>`n$links`n            </div>"
  }
  @"
<div class="nav-item nav-item--wide nav-item--mega nav-item--mega-kunden">
          <a class="nav-trigger" href="${prefix}kunden/index.html"$cur>Kunden</a>
          <div class="nav-dropdown nav-dropdown--mega nav-dropdown--mega-kunden">
$($clusterBlocks -join "`n")
          </div>
        </div>
        
"@
}

function Build-Mobile([string]$prefix, [bool]$current) {
  $cur = if ($current) { ' aria-current="page"' } else { '' }
  $items = foreach ($c in $Clusters) {
    $linkLines = foreach ($pair in $c.Links) {
      $href = $pair[0]
      $label = $pair[1]
      '          <a class="mobile-link" href="{0}{1}">{2}</a>' -f $prefix, $href, $label
    }
    $links = $linkLines -join "`n"
    "          <p class=`"mobile-menu__subtitle`">$($c.Title)</p>`n$links"
  }
  @"
<div class="mobile-menu__group mobile-menu__group--mega mobile-menu__group--mega-kunden">
          <a class="mobile-menu__group-title" href="${prefix}kunden/index.html"$cur>Kunden</a>
$($items -join "`n")
          <button type="button" class="mobile-link" data-inert>Extranet</button>
          <a class="mobile-link mobile-link--cta" href="${prefix}kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
        </div>
        
"@
}

$DesktopRe = [regex]'(?s)<div class="nav-item[^"]*">\s*<a class="nav-trigger"[^>]*>Kunden</a>[\s\S]*?(?=<div class="nav-item|<\/nav>)'
$MobileRe = [regex]'(?s)<div class="mobile-menu__group[^"]*">\s*<a class="mobile-menu__group-title"[^>]*>Kunden</a>[\s\S]*?(?=<div class="mobile-menu__group)'

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

function Update-File([string]$file, [string]$rel) {
  if (-not (Select-String -Path $file -Pattern '>Kunden</a>' -Quiet)) { return $false }
  $depth = ($rel -split '/').Count - 1
  if ($rel -eq 'leadwerk_theme/partials/site-header.html') { $depth = 0 }
  $prefix = Get-Prefix $depth
  $isCurrent = Test-KundenSection $rel
  $html = [IO.File]::ReadAllText($file)
  $original = $html
  if ($DesktopRe.IsMatch($html)) { $html = $DesktopRe.Replace($html, (Build-Desktop $prefix $isCurrent), 1) }
  if ($MobileRe.IsMatch($html)) { $html = $MobileRe.Replace($html, (Build-Mobile $prefix $isCurrent), 1) }
  if ($html -ne $original) {
    [IO.File]::WriteAllText($file, $html, [Text.UTF8Encoding]::new($false))
    return $true
  }
  return $false
}

$changed = 0
Get-ChildItem -Path $Root -Recurse -Filter '*.html' -File | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
  if (Test-Excluded $rel) { return }
  if (Update-File $_.FullName $rel) { $changed++ }
}

$themeHeader = Join-Path $Root 'leadwerk_theme/partials/site-header.html'
if (Test-Path $themeHeader) {
  if (Update-File $themeHeader 'leadwerk_theme/partials/site-header.html') { $changed++ }
}

Write-Host "Aktualisiert: $changed Dateien"
