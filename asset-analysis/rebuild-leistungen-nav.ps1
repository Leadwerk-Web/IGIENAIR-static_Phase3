$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Exclude = @('asset-analysis','leadwerk_importer','leadwerk_theme','leadwerk-fields','leadwerk-wpml-clone','.playwright-mcp','node_modules','.git','docs','Bildmaterial_final','assets')

function Test-Excluded([string]$rel) {
  foreach ($part in $Exclude) {
    if ($rel -eq $part -or $rel.StartsWith("$part/")) { return $true }
  }
  return $false
}

function Update-LeistungenNav([string]$html) {
  if ($html -notmatch '>Leistungen</a>') { return $html }

  $desktopGefahr = '(?m)^\s*<a class="nav-link" href="[^"]*gefaehrdungsbeurteilung-vdi-2047/index\.html"><span>Risikoanalyse VDI 2047-2</span></a>\r?\n'
  $mobileGefahr = '(?m)^\s*<a class="mobile-link" href="[^"]*gefaehrdungsbeurteilung-vdi-2047/index\.html">Risikoanalyse VDI 2047-2</a>\r?\n'

  if ($html -match '<p class="nav-cluster__title">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\s*<a class="nav-link" href="([^"]*)anlagen/kuehlturmreinigung/index\.html"') {
    $prefix = $Matches[1]
    $desktopInsert = "              <a class=`"nav-link`" href=`"${prefix}gefaehrdungsbeurteilung-vdi-2047/index.html`"><span>Risikoanalyse VDI 2047-2</span></a>`n"
    $html = [regex]::Replace($html, $desktopGefahr, '')
    if ($html -notmatch '<p class="nav-cluster__title">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\s*<a class="nav-link" href="[^"]*gefaehrdungsbeurteilung-vdi-2047') {
      $html = [regex]::Replace(
        $html,
        '(<p class="nav-cluster__title">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\r?\n)',
        "`$1$desktopInsert",
        1
      )
    }
  }

  if ($html -match '<p class="mobile-menu__subtitle">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\s*<a class="mobile-link" href="([^"]*)anlagen/kuehlturmreinigung/index\.html"') {
    $prefix = $Matches[1]
    $mobileInsert = "          <a class=`"mobile-link`" href=`"${prefix}gefaehrdungsbeurteilung-vdi-2047/index.html`">Risikoanalyse VDI 2047-2</a>`n"
    $html = [regex]::Replace($html, $mobileGefahr, '')
    if ($html -notmatch '<p class="mobile-menu__subtitle">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\s*<a class="mobile-link" href="[^"]*gefaehrdungsbeurteilung-vdi-2047') {
      $html = [regex]::Replace(
        $html,
        '(<p class="mobile-menu__subtitle">K&uuml;hlturm &amp; Verdunstungsk&uuml;hlanlagen</p>\r?\n)',
        "`$1$mobileInsert",
        1
      )
    }
  }

  return $html
}

$changed = 0
Get-ChildItem -Path $Root -Recurse -Filter '*.html' -File | ForEach-Object {
  $rel = $_.FullName.Substring($Root.Length + 1).Replace('\', '/')
  if (Test-Excluded $rel) { return }
  $original = [IO.File]::ReadAllText($_.FullName)
  $updated = Update-LeistungenNav $original
  if ($updated -ne $original) {
    [IO.File]::WriteAllText($_.FullName, $updated, [Text.UTF8Encoding]::new($false))
    $changed++
  }
}

Write-Host "Aktualisiert: $changed Dateien"
