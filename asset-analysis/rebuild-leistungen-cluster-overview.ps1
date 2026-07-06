$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Target = Join-Path $Root 'leistungen/index.html'

function Get-LeistungenHref([string]$slug) {
  if ($slug.StartsWith('leistungen/')) { return './' + $slug.Substring(11) }
  return '../' + $slug
}

$Clusters = @(
  @{
    Title = 'Betreiberpflicht &amp; Hygieneinspektion'
    Text  = 'Hygieneinspektion nach VDI 6022, Luftkeimmessung, Gutachten und auditf&auml;hige Bilddokumentation f&uuml;r RLT-Anlagen.'
    Links = @(
      ,@('hygieneinspektion-vdi-6022/index.html','Hygieneinspektion VDI 6022')
      ,@('rlt-hygiene/index.html','RLT-Hygiene')
      ,@('leistungen/vdi-6022-pruefbericht-musterbericht/index.html','VDI 6022 Pr&uuml;fbericht &amp; Musterbericht')
      ,@('leistungen/luftkeimmessung-rlt-anlagen/index.html','Luftkeimmessung RLT-Anlagen')
      ,@('leistungen/inspektionundgutachten/index.html','Inspektion &amp; Gutachten')
    )
  }
  @{
    Title = 'Reinigung &amp; Instandhaltung'
    Text  = 'Normgerechte L&uuml;ftungs-, Luftkanal- und RLT-Anlagenreinigung nach DIN EN 15780 und VDI 6022 &ndash; mit Vorher-/Nachher-Doku.'
    Links = @(
      ,@('anlagen/lueftungsreinigung/index.html','L&uuml;ftungsreinigung VDI 6022')
      ,@('anlagen/luftkanalreinigung/index.html','Luftkanalreinigung VDI 6022')
      ,@('anlagen/lueftungsanlagenreinigung/index.html','RLT-Anlagenreinigung VDI 6022')
      ,@('leistungen/rlt-reinigung-industrie/index.html','RLT-Reinigung Industrie')
      ,@('leistungen/lueftungsreinigung-krankenhaus-klinik/index.html','L&uuml;ftungsreinigung Krankenhaus / Klinik')
      ,@('leistungen/reinigung-desinfektion/index.html','Reinigung &amp; Desinfektion')
    )
  }
  @{
    Title = 'K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen'
    Text  = 'Risikoanalyse, Reinigung und Entkalkung nach VDI 2047-2 und 42. BImSchV &ndash; dokumentierte Betreiberpflicht.'
    Links = @(
      ,@('gefaehrdungsbeurteilung-vdi-2047/index.html','Risikoanalyse VDI 2047-2')
      ,@('anlagen/kuehlturmreinigung/index.html','K&uuml;hlturmreinigung 42. BImSchV')
      ,@('leistungen/verdunstungskuehlanlage-vdi-2047-42-bimschv/index.html','Verdunstungsk&uuml;hlanlage VDI 2047-2')
      ,@('leistungen/kuehlturm-entkalkung-biofilm/index.html','K&uuml;hlturm Entkalkung &amp; Biofilm')
    )
  }
  @{
    Title = 'OP, Reinraum &amp; Filterpr&uuml;fung'
    Text  = 'OP-Raum-Qualifizierung nach DIN 1946-4, Reinraumpr&uuml;fung nach ISO 14644 sowie Partikel- und Filterpr&uuml;fung.'
    Links = @(
      ,@('anlagen/op-raum-pruefung/index.html','OP-Raum DIN 1946-4')
      ,@('anlagen/reinraumqualifizierung/index.html','Reinraum ISO 14644')
      ,@('leistungen/partikelmessung-reinraum-iso-14644/index.html','Partikelmessung Reinraum')
      ,@('leistungen/dehs-leckpruefung-op-raum/index.html','DEHS-Leckpr&uuml;fung OP-Raum')
      ,@('filterintegritaetstest/index.html','Filterintegrit&auml;tstest')
      ,@('lecktest-schwebstofffilter/index.html','Schwebstofffilter-Lecktest')
    )
  }
  @{
    Title = 'Energie'
    Text  = 'Energetische Inspektion nach GEG f&uuml;r Klima-/RLT-Anlagen &ndash; Energie sparen und gesetzliche Pflichten erf&uuml;llen.'
    Links = @(
      ,@('energetische-inspektion-geg-2020/index.html','Energetische Inspektion GEG')
    )
  }
  @{
    Title = 'Sanierung'
    Text  = 'Hygienische Instandsetzung und Sanierung von RLT-Anlagen, Korrosionsschutz sowie K&uuml;hlturmsanierung.'
    Links = @(
      ,@('leistungen/rlt-sanierung-korrosion-2k-epoxy/index.html','RLT-Sanierung Korrosion &amp; 2K-Epoxy')
      ,@('leistungen/instandsetzung-sanierung/index.html','Instandsetzung &amp; Sanierung')
      ,@('leistungen/kuehlturm-sanierung-fuellkoerper-duesen/index.html','K&uuml;hlturmsanierung')
    )
  }
)

$cards = for ($i = 0; $i -lt $Clusters.Count; $i++) {
  $c = $Clusters[$i]
  $num = '{0:D2}' -f ($i + 1)
  $items = foreach ($pair in $c.Links) {
    $href = Get-LeistungenHref $pair[0]
    $label = $pair[1]
    "              <li><a href=`"$href`">$label</a></li>"
  }
  $linkBlock = $items -join "`n"
  @"
          <article class="svc-cluster-card">
            <span class="svc-cluster-card__eyebrow">Cluster $num</span>
            <h3 class="svc-cluster-card__title">$($c.Title)</h3>
            <p class="svc-cluster-card__text">$($c.Text)</p>
            <ul class="svc-cluster-card__links">
$linkBlock
            </ul>
          </article>
"@
}

$html = [IO.File]::ReadAllText($Target)
$pattern = '(?s)(<div class="svc-clusters">).*?(</div>\s*</div>\s*</section>\s*<section class="svc-section svc-section--soft" id="entscheidungshilfe")'
$replacement = "`$1`n$($cards -join "`n")`n        `$2"
$updated = [regex]::Replace($html, $pattern, $replacement, 1)

if ($updated -eq $html) {
  Write-Error 'Leistungscluster-Block in leistungen/index.html nicht gefunden.'
}

[IO.File]::WriteAllText($Target, $updated, [Text.UTF8Encoding]::new($false))
Write-Host 'Leistungscluster in leistungen/index.html aktualisiert.'
