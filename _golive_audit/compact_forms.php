<?php
/**
 * Verschiebt die Labels von Text-/E-Mail-/Telefon-/Textarea-Feldern in den
 * Placeholder und blendet das Label aus (label_hide), damit die Formulare
 * kompakter werden. Selects und Checkboxen behalten ihr sichtbares Label.
 * Ausfuehren mit: wp eval-file compact_forms.php
 */

$placeholder_types = array( 'text', 'email', 'phone', 'textarea' );

foreach ( array( 577, 579 ) as $form_id ) {
	$post = get_post( $form_id );
	if ( ! $post ) {
		echo "Form {$form_id} nicht gefunden\n";
		continue;
	}
	$data = json_decode( $post->post_content, true );
	if ( ! is_array( $data ) || empty( $data['fields'] ) ) {
		echo "Form {$form_id}: Felder nicht lesbar\n";
		continue;
	}

	// Backup des Originals als Postmeta, damit die Aenderung umkehrbar bleibt.
	if ( ! get_post_meta( $form_id, '_leadwerk_form_backup_compact', true ) ) {
		update_post_meta( $form_id, '_leadwerk_form_backup_compact', wp_slash( $post->post_content ) );
	}

	$changed = 0;
	foreach ( $data['fields'] as $fid => $field ) {
		$type = $field['type'] ?? '';
		if ( ! in_array( $type, $placeholder_types, true ) ) {
			continue;
		}
		$label = trim( (string) ( $field['label'] ?? '' ) );
		if ( '' === $label ) {
			continue;
		}
		$placeholder = trim( (string) ( $field['placeholder'] ?? '' ) );
		if ( '' === $placeholder ) {
			$placeholder = $label . ( isset( $field['required'] ) ? ' *' : '' );
		}
		$data['fields'][ $fid ]['placeholder'] = $placeholder;
		$data['fields'][ $fid ]['label_hide']  = '1';
		$changed++;
	}

	wp_update_post(
		array(
			'ID'           => $form_id,
			'post_content' => wp_slash( wp_json_encode( $data ) ),
		)
	);
	echo "Form {$form_id}: {$changed} Felder auf Placeholder umgestellt\n";
}
