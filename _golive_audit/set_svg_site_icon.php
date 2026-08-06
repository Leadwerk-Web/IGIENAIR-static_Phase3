<?php
/**
 * Ersetzt das WordPress-Site-Icon durch das SVG-Favicon aus dem Theme.
 * Legt das SVG als Attachment an (falls noch nicht vorhanden) und setzt
 * die Option site_icon darauf.
 * Ausfuehren mit: wp eval-file set_svg_site_icon.php
 */

$source = get_template_directory() . '/assets/images/logos/favicon.svg';
if ( ! is_readable( $source ) ) {
	echo "favicon.svg nicht gefunden: {$source}\n";
	exit( 1 );
}

// Bereits importiert?
$existing = get_posts(
	array(
		'post_type'      => 'attachment',
		'post_mime_type' => 'image/svg+xml',
		'posts_per_page' => 1,
		'fields'         => 'ids',
		'meta_key'       => '_leadwerk_svg_favicon',
		'meta_value'     => '1',
	)
);

if ( $existing ) {
	$attachment_id = (int) $existing[0];
	echo "SVG-Attachment vorhanden: {$attachment_id}\n";
} else {
	$uploads = wp_upload_dir();
	$target  = trailingslashit( $uploads['path'] ) . wp_unique_filename( $uploads['path'], 'favicon.svg' );
	if ( ! copy( $source, $target ) ) {
		echo "Kopieren fehlgeschlagen\n";
		exit( 1 );
	}
	$attachment_id = wp_insert_attachment(
		array(
			'post_mime_type' => 'image/svg+xml',
			'post_title'     => 'IGIENAIR Favicon (SVG)',
			'post_status'    => 'inherit',
		),
		$target
	);
	if ( is_wp_error( $attachment_id ) || ! $attachment_id ) {
		echo "Attachment konnte nicht angelegt werden\n";
		exit( 1 );
	}
	update_post_meta( $attachment_id, '_wp_attachment_image_alt', 'IGIENAIR' );
	update_post_meta( $attachment_id, '_leadwerk_svg_favicon', '1' );
	echo "SVG importiert als Attachment {$attachment_id}\n";
}

$old = (int) get_option( 'site_icon' );
update_option( 'site_icon', $attachment_id );
echo "site_icon: {$old} -> {$attachment_id} (", wp_get_attachment_url( $attachment_id ), ")\n";
