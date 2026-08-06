<?php
/**
 * Angebots-Formular (579) so kompakt wie das statische Original:
 * - Feld 5 (Select "identisch?"): Label ausblenden, Frage bleibt Placeholder.
 * - Felder 6-10 (Hinweistext + Durchfuehrungsort-Adresse): nur zeigen,
 *   wenn Feld 5 = "Nein" (Choice 2) – wie data-alt-address im Original.
 * - Felder 18/19 (Consent-Checkboxen): Labels ausblenden.
 * Feld 15 ("Sie wuenschen ein Angebot fuer:") behaelt sein Label wie die
 * Legende im statischen Formular.
 * Ausfuehren mit: wp eval-file compact_offer_form.php
 */

$form_id = 579;
$post = get_post( $form_id );
$data = json_decode( $post->post_content, true );
if ( ! is_array( $data ) || empty( $data['fields'] ) ) {
	echo "Form {$form_id}: Felder nicht lesbar\n";
	exit( 1 );
}

// Select: Label ausblenden (Frage steht bereits als Placeholder).
$data['fields'][5]['label_hide'] = '1';

// Hinweistext + 4 Adressfelder nur bei "Nein" zeigen.
foreach ( array( 6, 7, 8, 9, 10 ) as $fid ) {
	if ( ! isset( $data['fields'][ $fid ] ) ) {
		continue;
	}
	$data['fields'][ $fid ]['conditional_logic'] = '1';
	$data['fields'][ $fid ]['conditional_type']  = 'show';
	$data['fields'][ $fid ]['conditionals']      = array(
		array(
			array(
				'field'    => '5',
				'operator' => '==',
				'value'    => '2',
			),
		),
	);
}

// Consent-Checkboxen ohne Ueberschrift wie im Original.
$data['fields'][18]['label_hide'] = '1';
$data['fields'][19]['label_hide'] = '1';

wp_update_post(
	array(
		'ID'           => $form_id,
		'post_content' => wp_slash( wp_json_encode( $data ) ),
	)
);
echo "Form {$form_id}: kompakt gemacht (Label 5/18/19 versteckt, Felder 6-10 konditional)\n";
