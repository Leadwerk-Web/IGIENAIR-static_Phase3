<?php
/**
 * Backfill: Yoast-Fokus-Keywords, statisches JSON-LD (FAQ/Service) und
 * 301-Redirect-Ziele fuer Weiterleitungs-Stub-Seiten.
 * Ausfuehren mit: wp eval-file backfill_seo.php
 */

$repo = '/Users/atlas/Documents/Github/IGIENAIR-static_Phase3';

$pages = get_posts( array(
	'post_type'      => 'page',
	'post_status'    => 'publish',
	'posts_per_page' => -1,
	'orderby'        => 'ID',
	'order'          => 'ASC',
) );

$stats = array( 'focuskw' => 0, 'jsonld' => 0, 'redirect' => 0, 'skipped' => array() );

foreach ( $pages as $page ) {
	$path = wp_parse_url( get_permalink( $page ), PHP_URL_PATH );
	$path = trim( (string) $path, '/' );

	// 1) Stub-Erkennung: Seiten, deren Inhalt nur ein "Weiter zur Seite"-Link ist.
	$rendered = leadwerk_theme_render_current_page_content( $page->ID );
	$is_stub  = false;
	if ( preg_match( '#<main[^>]*>\s*<p>\s*<a href="([^"]+)">\s*Weiter zur Seite\s*</a>\s*</p>\s*</main>#u', $rendered, $m ) ) {
		$is_stub = true;
		$target  = wp_parse_url( $m[1], PHP_URL_PATH );
		if ( $target ) {
			update_post_meta( $page->ID, 'igienair_redirect_target', $target );
			$stats['redirect']++;
		}
	}

	// 2) Fokus-Keyword aus dem Yoast-/Dokumenttitel ableiten.
	if ( ! $is_stub && ! in_array( $page->post_name, array( 'danke', 'cookie-richtlinie-eu' ), true ) ) {
		$title = (string) get_post_meta( $page->ID, '_yoast_wpseo_title', true );
		if ( '' === $title ) {
			$title = (string) get_post_meta( $page->ID, 'leadwerk_document_title', true );
		}
		if ( '' === $title ) {
			$title = $page->post_title;
		}
		$kw = preg_split( '/\s*[|]\s*/u', $title )[0];
		$kw = preg_split( '/\s+[–—]\s+/u', $kw )[0];
		$kw = preg_replace( '/\b(Igienair|IGIENAIR)( GmbH)?\b/u', '', $kw );
		$kw = trim( preg_replace( '/\s{2,}/', ' ', $kw ), " \t:,-" );
		$kw = preg_replace( '/\s+(bei der|bei|der|die|das|für|von|mit|und)$/u', '', $kw );
		if ( function_exists( 'mb_substr' ) ) {
			$kw = mb_substr( $kw, 0, 80 );
		}
		if ( '' !== $kw ) {
			update_post_meta( $page->ID, '_yoast_wpseo_focuskw', $kw );
			$stats['focuskw']++;
		}
	}

	// 3) JSON-LD aus statischer Quelle uebernehmen (ohne BreadcrumbList, das liefert Yoast).
	$file = '' === $path ? $repo . '/index.html' : $repo . '/' . $path . '/index.html';
	if ( ! $is_stub && file_exists( $file ) ) {
		$html = (string) file_get_contents( $file );
		if ( preg_match( '#<script type="application/ld\+json">(.*?)</script>#s', $html, $m ) ) {
			$data = json_decode( trim( $m[1] ), true );
			if ( is_array( $data ) ) {
				if ( isset( $data['@graph'] ) && is_array( $data['@graph'] ) ) {
					// BreadcrumbList/Organization/WebSite/WebPage liefert bereits Yoast – nur FAQ/Service etc. uebernehmen.
					$data['@graph'] = array_values( array_filter( $data['@graph'], function ( $piece ) {
						return ! in_array( $piece['@type'] ?? '', array( 'BreadcrumbList', 'Organization', 'WebSite', 'WebPage' ), true );
					} ) );
					// Lokale Vorschau: Live-Domain-URLs bleiben erhalten (Canonical-Logik), keine Ersetzung noetig.
					if ( ! empty( $data['@graph'] ) ) {
						update_post_meta( $page->ID, 'igienair_jsonld', wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
						$stats['jsonld']++;
					}
				} elseif ( ( $data['@type'] ?? '' ) !== 'BreadcrumbList' ) {
					update_post_meta( $page->ID, 'igienair_jsonld', wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
					$stats['jsonld']++;
				}
			}
		}
	} elseif ( ! $is_stub && ! file_exists( $file ) ) {
		$stats['skipped'][] = $path;
	}
}

echo "Fokus-Keywords gesetzt: {$stats['focuskw']}\n";
echo "JSON-LD uebernommen:    {$stats['jsonld']}\n";
echo "Redirect-Ziele gesetzt: {$stats['redirect']}\n";
if ( $stats['skipped'] ) {
	echo 'Keine statische Quelle gefunden: ' . implode( ', ', array_slice( $stats['skipped'], 0, 15 ) ) . "\n";
}
