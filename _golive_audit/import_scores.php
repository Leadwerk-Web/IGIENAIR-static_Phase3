<?php
/**
 * Schreibt die extern berechneten Yoast-Scores in die Postmetas und
 * aktualisiert die Yoast-Indexables (Quelle der Ampel-Farben in der Seitenliste).
 * Ausfuehren mit: wp eval-file import_scores.php <scores.json>
 */

$file = $args[0] ?? '';
$rows = json_decode( (string) file_get_contents( $file ), true );
if ( ! is_array( $rows ) ) {
	echo "Scores-Datei nicht lesbar: {$file}\n";
	exit( 1 );
}

$updated = 0;
foreach ( $rows as $row ) {
	if ( ! empty( $row['error'] ) || empty( $row['id'] ) ) {
		continue;
	}
	$post_id = (int) $row['id'];
	update_post_meta( $post_id, '_yoast_wpseo_linkdex', (string) (int) $row['seo'] );
	update_post_meta( $post_id, '_yoast_wpseo_content_score', (string) (int) $row['readability'] );

	// Indexable direkt aktualisieren, damit die Ampeln in der Seitenliste sofort stimmen.
	if ( class_exists( '\Yoast\WP\SEO\Models\Indexable' ) && function_exists( 'YoastSEO' ) ) {
		$repo = YoastSEO()->classes->get( \Yoast\WP\SEO\Repositories\Indexable_Repository::class );
		$indexable = $repo->find_by_id_and_type( $post_id, 'post', false );
		if ( $indexable ) {
			$indexable->primary_focus_keyword       = (string) get_post_meta( $post_id, '_yoast_wpseo_focuskw', true );
			$indexable->primary_focus_keyword_score = (int) $row['seo'];
			$indexable->readability_score           = (int) $row['readability'];
			$indexable->save();
		}
	}
	$updated++;
}

wp_cache_flush();
echo "Scores uebernommen fuer {$updated} Seiten.\n";
