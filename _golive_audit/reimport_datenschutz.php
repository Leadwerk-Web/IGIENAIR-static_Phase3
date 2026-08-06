<?php
/**
 * Re-parst die Datenschutz-Seite aus den Importer-Quelldateien und schreibt
 * die Sections neu. Noetig, weil ein frueherer direkter Meta-Eingriff die
 * Backslashes im JSON entfernt hat ("\n" wurde zu "n" und erschien im Text).
 * Ausfuehren mit: wp eval-file reimport_datenschutz.php
 */

$post_id = 957;
$source_file = (string) get_post_meta( $post_id, 'leadwerk_source_file', true );
echo "Quelle: {$source_file}\n";

$importer = new Leadwerk_Importer( false );
$ref = new ReflectionMethod( Leadwerk_Importer::class, 'parse_sections' );
$ref->setAccessible( true );
$file = LEADWERK_IMPORTER_PATH . 'source_assets/pages/' . $source_file;
$sections = $ref->invoke( $importer, $file, $source_file );
if ( is_wp_error( $sections ) ) {
	echo 'Parse-Fehler: ' . $sections->get_error_message() . "\n";
	exit( 1 );
}
$valid = Leadwerk_Content_Schema::validate_sections( $sections );
if ( is_wp_error( $valid ) ) {
	echo 'Schema-Fehler: ' . $valid->get_error_message() . "\n";
	exit( 1 );
}
update_field( Leadwerk_Content_Schema::FIELD_NAME, Leadwerk_Content_Schema::sanitize_value( $sections ), $post_id );

$saved = get_post_meta( $post_id, 'igienair_sections', true );
$json = is_string( $saved ) ? $saved : wp_json_encode( $saved );
echo 'Sections neu geschrieben: ', count( $sections ), " Sections\n";
echo 'Kontrolle literal-n: ', substr_count( $json, '{"text":"n' ), ' / echte newline: ', substr_count( $json, '{"text":"\\n' ), "\n";
