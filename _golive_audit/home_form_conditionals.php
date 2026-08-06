<?php
/**
 * Home-Formular (577): Felder 8/9 (Durchfuehrungsadresse) nur anzeigen,
 * wenn Feld 7 ("identisch?") = "nein" (Choice 2) gewaehlt ist – wie im
 * statischen Original. Nutzt die native WPForms-Pro-Conditional-Logic.
 * Ausfuehren mit: wp eval-file home_form_conditionals.php
 */

$form_id = 577;
$post = get_post( $form_id );
$data = json_decode( $post->post_content, true );
if ( ! is_array( $data ) || empty( $data['fields'] ) ) {
	echo "Form {$form_id}: Felder nicht lesbar\n";
	exit( 1 );
}

foreach ( array( 8, 9 ) as $fid ) {
	if ( ! isset( $data['fields'][ $fid ] ) ) {
		continue;
	}
	$data['fields'][ $fid ]['conditional_logic'] = '1';
	$data['fields'][ $fid ]['conditional_type']  = 'show';
	$data['fields'][ $fid ]['conditionals']      = array(
		array(
			array(
				'field'    => '7',
				'operator' => '==',
				'value'    => '2',
			),
		),
	);
}

wp_update_post(
	array(
		'ID'           => $form_id,
		'post_content' => wp_slash( wp_json_encode( $data ) ),
	)
);
echo "Form {$form_id}: Conditional Logic fuer Felder 8/9 gesetzt (zeigen wenn Feld 7 = nein)\n";
