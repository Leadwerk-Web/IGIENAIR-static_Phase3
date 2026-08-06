<?php
/**
 * Macht das Home-Formular (577) so kompakt wie das statische Original:
 * - Select-Felder 7/10: Label ausblenden, Frage als Placeholder-Option.
 * - Checkbox 13: "Datenschutz"-Label ausblenden.
 * Ausfuehren mit: wp eval-file compact_home_form.php
 */

$form_id = 577;
$post = get_post( $form_id );
$data = json_decode( $post->post_content, true );
if ( ! is_array( $data ) || empty( $data['fields'] ) ) {
	echo "Form {$form_id}: Felder nicht lesbar\n";
	exit( 1 );
}

foreach ( array( 7, 10 ) as $fid ) {
	if ( isset( $data['fields'][ $fid ] ) && 'select' === $data['fields'][ $fid ]['type'] ) {
		$data['fields'][ $fid ]['label_hide']  = '1';
		$data['fields'][ $fid ]['placeholder'] = trim( (string) $data['fields'][ $fid ]['label'] );
	}
}
if ( isset( $data['fields'][13] ) && 'checkbox' === $data['fields'][13]['type'] ) {
	$data['fields'][13]['label_hide'] = '1';
}

wp_update_post(
	array(
		'ID'           => $form_id,
		'post_content' => wp_slash( wp_json_encode( $data ) ),
	)
);
echo "Form {$form_id}: Selects 7/10 mit Placeholder, Labels 7/10/13 ausgeblendet\n";
