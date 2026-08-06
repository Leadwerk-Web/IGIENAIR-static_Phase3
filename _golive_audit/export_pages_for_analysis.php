<?php
/**
 * Exportiert alle Seiten mit Keyword, Titel, Description und gerendertem Inhalt
 * als JSON fuer die Yoast-Analyse in Node.
 * Ausfuehren mit: wp eval-file export_pages_for_analysis.php <ausgabedatei>
 */

$out = $args[0] ?? '/tmp/yoast_pages.json';

$pages = get_posts( array(
	'post_type'      => 'page',
	'post_status'    => 'publish',
	'posts_per_page' => -1,
	'orderby'        => 'ID',
	'order'          => 'ASC',
) );

$rows = array();
foreach ( $pages as $page ) {
	$keyword = (string) get_post_meta( $page->ID, '_yoast_wpseo_focuskw', true );
	if ( '' === $keyword ) {
		continue; // Stubs / Danke / Cookie-Seite ohne Keyword ueberspringen.
	}
	$title = (string) get_post_meta( $page->ID, '_yoast_wpseo_title', true );
	if ( '' === $title ) {
		$title = (string) get_post_meta( $page->ID, 'leadwerk_document_title', true );
	}
	if ( '' === $title ) {
		$title = $page->post_title;
	}
	$content = leadwerk_theme_render_current_page_content( $page->ID );
	// Header/Nav-fremde Markup-Reste stoeren die Analyse nicht, aber Formulare entfernen.
	$content = preg_replace( '#<form.*?</form>#s', '', $content );
	$rows[] = array(
		'id'          => $page->ID,
		'slug'        => $page->post_name,
		'url'         => get_permalink( $page->ID ),
		'keyword'     => $keyword,
		'title'       => $title,
		'description' => (string) get_post_meta( $page->ID, '_yoast_wpseo_metadesc', true ),
		'content'     => $content,
	);
}

file_put_contents( $out, wp_json_encode( $rows, JSON_UNESCAPED_UNICODE ) );
echo 'Exportiert: ' . count( $rows ) . " Seiten -> {$out}\n";
