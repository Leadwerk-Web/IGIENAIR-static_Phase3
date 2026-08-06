<?php
/**
 * Listet die Felder der WPForms-Formulare (Typ, Label, Placeholder, Pflichtfeld).
 * Ausfuehren mit: wp eval-file inspect_forms.php
 */

foreach ( array( 577, 579 ) as $form_id ) {
	$post = get_post( $form_id );
	if ( ! $post ) {
		echo "Form {$form_id} nicht gefunden\n";
		continue;
	}
	$data = json_decode( $post->post_content, true );
	echo "=== Form {$form_id}: " . ( $data['settings']['form_title'] ?? '' ) . " ===\n";
	foreach ( (array) ( $data['fields'] ?? array() ) as $fid => $field ) {
		printf(
			"  [%s] type=%-12s label=%-55s placeholder=%-30s required=%s label_hide=%s\n",
			$fid,
			$field['type'] ?? '',
			'"' . ( $field['label'] ?? '' ) . '"',
			'"' . ( $field['placeholder'] ?? '' ) . '"',
			isset( $field['required'] ) ? '1' : '0',
			isset( $field['label_hide'] ) ? '1' : '0'
		);
	}
}
