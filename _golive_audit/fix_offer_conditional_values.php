<?php
/**
 * Form 579, Feld 5: explizite Choice-Werte (ja/nein) setzen, damit die
 * Conditional-Logic greift. WPForms vergleicht case-sensitiv und erzeugt
 * die Regel kleingeschrieben ("nein"), waehrend die Option "Nein" lieferte.
 * Ausfuehren mit: wp eval-file fix_offer_conditional_values.php
 */

$form_id = 579;
$post = get_post( $form_id );
$data = json_decode( $post->post_content, true );

$data['fields'][5]['show_values'] = '1';
$data['fields'][5]['choices'][1]['value'] = 'ja';
$data['fields'][5]['choices'][2]['value'] = 'nein';

wp_update_post(
	array(
		'ID'           => $form_id,
		'post_content' => wp_slash( wp_json_encode( $data ) ),
	)
);
echo "Form {$form_id}: Choice-Werte ja/nein gesetzt\n";
