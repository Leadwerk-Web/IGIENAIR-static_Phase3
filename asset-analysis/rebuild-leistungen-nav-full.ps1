$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','leadwerk-fields','leadwerk-wpml-clone','.playwright-mcp','node_modules','.git','docs','Bildmaterial_final','assets')

# Komma vor inneren Arrays verhindert Flattening in PowerShell
$Clusters = @(
  @{ Title = 'Betreiberpflicht &amp; Hygieneinspektion'; Links = @(
      ,@('hygieneinspektion-vdi-6022/index.html','Hygieneinspektion VDI 6022')
      ,@('rlt-hygiene/index.html','RLT-Hygiene')
      ,@('leistungen/vdi-6022-pruefbericht-musterbericht/index.html','VDI 6022 Pr&uuml;fbericht &amp; Musterbericht')
      ,@('leistungen/luftkeimmessung-rlt-anlagen/index.html','Luftkeimmessung RLT-Anlagen')
      ,@('leistungen/inspektionundgutachten/index.html','Inspektion &amp; Gutachten')
    ) }
  @{ Title = 'Reinigung &amp; Instandhaltung'; Links = @(
      ,@('anlagen/lueftungsreinigung/index.html','L&uuml;ftungsreinigung VDI 6022')
      ,@('anlagen/luftkanalreinigung/index.html','Luftkanalreinigung VDI 6022')
      ,@('anlagen/lueftungsanlagenreinigung/index.html','RLT-Anlagenreinigung VDI 6022')
      ,@('leistungen/rlt-reinigung-industrie/index.html','RLT-Reinigung Industrie')
      ,@('leistungen/lueftungsreinigung-krankenhaus-klinik/index.html','L&uuml;ftungsreinigung Krankenhaus / Klinik')
      ,@('leistungen/reinigung-desinfektion/index.html','Reinigung &amp; Desinfektion')
    ) }
  @{ Title = 'K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen'; Links = @(
      ,@('gefaehrdungsbeurteilung-vdi-2047/index.html','Risikoanalyse VDI 2047-2')
      ,@('anlagen/kuehlturmreinigung/index.html','K&uuml;hlturmreinigung 42. BImSchV')
      ,@('leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html','Verdunstungsk&uuml;hlanlage VDI 2047-2')
      ,@('leistungen/kuehlturm-entkalkung-biofilm/index.html','K&uuml;hlturm Entkalkung &amp; Biofilm')
    ) }
  @{ Title = 'OP, Reinraum &amp; Filterpr&uuml;fung'; Links = @(
      ,@('anlagen/op-raum-pruefung/index.html','OP-Raum DIN 1946-4')
      ,@('anlagen/reinraumqualifizierung/index.html','Reinraum ISO 14644')
      ,@('leistungen/partikelmessung-reinraum-iso-14644/index.html','Partikelmessung Reinraum')
      ,@('leistungen/dehs-leckpruefung-op-raum/index.html','DEHS-Leckpr&uuml;fung OP-Raum')
      ,@('filterintegritaetstest/index.html','Filterintegrit&auml;tstest')
      ,@('lecktest-schwebstofffilter/index.html','Schwebstofffilter-Lecktest')
    ) }
  @{ Title = 'Energie'; Links = @(
      ,@('energetische-inspektion-geg-2020/index.html','Energetische Inspektion GEG')
    ) }
  @{ Title = 'Sanierung'; Links = @(
      ,@('leistungen/rlt-sanierung-korrosion-2k-epoxy/index.html','RLT-Sanierung Korrosion &amp; 2K-Epoxy')
      ,@('leistungen/instandsetzung-sanierung/index.html','Instandsetzung &amp; Sanierung')
      ,@('leistungen/kuehlturm-sanierung-fuellkoerper-duesen/index.html','K&uuml;hlturmsanierung')
    ) }
)

function Get-Prefix([int]$depth) {
  if ($depth -eq 0) { return './' }
  return ('../' * $depth)
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
<div class="nav-item nav-item--wide nav-item--mega">
          <a class="nav-trigger" href="${prefix}leistungen/index.html"$cur>Leistungen</a>
          <div class="nav-dropdown nav-dropdown--mega">
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
<div class="mobile-menu__group mobile-menu__group--mega">
          <a class="mobile-menu__group-title" href="${prefix}leistungen/index.html"$cur>Leistungen</a>
$($items -join "`n")
          <a class="mobile-link mobile-link--cta" href="${prefix}kontakt/angebot-anfordern/index.html">Angebot anfordern</a>
        </div>
        
"@
}

$DesktopRe = [regex]'(?s)<div class="nav-item[^"]*">\s*<a class="nav-trigger"[^>]*>Leistungen</a>[\s\S]*?(?=<div class="nav-item|</nav>)'
$MobileRe = [regex]'(?s)<div class="mobile-menu__group[^"]*">\s*<a class="mobile-menu__group-title"[^>]*>Leistungen<\/a>[\s\S]*?(?=<div class="mobile-menu__group)'

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

function Update-File([string]$file, [string]$rel) {
  if (-not (Select-String -Path $file -Pattern '>Leistungen</a>' -Quiet)) { return $false }
  $depth = ($rel -split '/').Count - 1
  if ($rel -eq 'leadwerk_theme/partials/site-header.html') { $depth = 0 }
  $prefix = Get-Prefix $depth
  $isCurrent = $rel.StartsWith('leistungen/')
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
